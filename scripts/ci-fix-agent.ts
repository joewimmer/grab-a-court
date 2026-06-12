import { appendFileSync } from "node:fs";
import { Agent, CursorAgentError, type SDKMessage } from "@cursor/sdk";

const apiKey = process.env.CURSOR_API_KEY!;
const repo = process.env.GITHUB_REPOSITORY!;
const ref = process.env.FAILED_REF ?? "main";
const runUrl = process.env.FAILED_RUN_URL ?? "(unknown)";

const prompt = [
  `CI failed on branch \`${ref}\` of ${repo}. Run details: ${runUrl}.`,
  `Reproduce with \`make lint\`, \`make test\`, and \`make build\`.`,
  `Find the root cause and apply the smallest correct fix. Do NOT make a`,
  `change you are unsure about - it is better to under-fix than to ship a`,
  `risky change. Verify all three commands pass before finishing.`,
  `End your reply with ONE fenced json block and nothing after it:`,
  '```json\n{ "canFix": true|false, "confidence": "high"|"medium"|"low",',
  `"rootCause": "...", "riskNotes": "...", "summary": "..." }\n\`\`\``,
  `Set canFix=false (and do not fabricate edits) if you cannot make all`,
  `checks pass. Use "high" only when the fix is obviously correct and`,
  `low-risk; use "medium"/"low" when it touches business rules, the DB`,
  `schema/migrations, or auth/middleware, or when you are not fully sure.`,
].join(" ");

interface Verdict {
  canFix?: boolean;
  confidence?: "high" | "medium" | "low";
  rootCause?: string;
  riskNotes?: string;
  summary?: string;
}

function parseVerdict(text: string): Verdict | null {
  const matches = [...text.matchAll(/```json\s*([\s\S]*?)```/g)];
  const last = matches.pop();
  if (!last) {
    return null;
  }
  try {
    return JSON.parse(last[1]) as Verdict;
  } catch {
    return null;
  }
}

function out(key: string, value: string): void {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
}

function sanitizeOutput(value: string): string {
  return value.replace(/\n/g, " ");
}

function logProgress(message: string): void {
  console.log(`[ci-fix-agent] ${message}`);
}

function summarizeToolInput(name: string, args: unknown): string {
  if (!args || typeof args !== "object") {
    return "";
  }
  const record = args as Record<string, unknown>;
  if (name === "shell" && typeof record.command === "string") {
    return record.command.length > 100
      ? `${record.command.slice(0, 100)}...`
      : record.command;
  }
  if (typeof record.path === "string") {
    return record.path;
  }
  if (typeof record.file_path === "string") {
    return record.file_path;
  }
  return "";
}

function logStreamEvent(event: SDKMessage): void {
  switch (event.type) {
    case "status":
      logProgress(
        `cloud status: ${event.status}${event.message ? ` (${event.message})` : ""}`,
      );
      break;
    case "tool_call": {
      const detail = summarizeToolInput(event.name, event.args);
      if (event.status === "running") {
        logProgress(
          `tool start: ${event.name}${detail ? ` — ${detail}` : ""}`,
        );
      } else {
        logProgress(`tool ${event.status}: ${event.name}`);
      }
      break;
    }
    case "task":
      if (event.text?.trim()) {
        logProgress(`task: ${event.text.trim().split("\n")[0]}`);
      }
      break;
    default:
      break;
  }
}

async function main(): Promise<void> {
  logProgress(`target repo: ${repo} @ ${ref}`);
  logProgress(`failing run: ${runUrl}`);
  logProgress("creating cloud agent (VM provision + repo clone)...");

  await using agent = await Agent.create({
    apiKey,
    model: { id: "composer-2.5" },
    cloud: {
      repos: [{ url: `https://github.com/${repo}`, startingRef: ref }],
      autoCreatePR: true,
      skipReviewerRequest: true,
    },
  });

  logProgress(`agent started: ${agent.agentId}`);
  logProgress("track live at https://cursor.com/agents");
  logProgress("sending fix prompt...");

  const run = await agent.send(prompt);

  logProgress(`run started: ${run.id}`);
  if (run.requestId) {
    logProgress(`requestId: ${run.requestId}`);
  }
  logProgress(
    "cloud agent is working — this often takes 10–20 minutes. Streaming progress below:",
  );

  for await (const event of run.stream()) {
    logStreamEvent(event);
  }

  const result = await run.wait();

  logProgress(
    `run finished: status=${result.status} durationMs=${result.durationMs ?? "unknown"}`,
  );
  if (result.status === "error") {
    process.exit(2);
  }

  const verdict = parseVerdict(result.result ?? "");
  const prUrl = result.git?.branches?.find((b) => b.prUrl)?.prUrl ?? "";
  const confidence = verdict?.confidence ?? "low";
  const canFix = verdict?.canFix === true && !!prUrl;

  const decision = !canFix ? "escalate" : confidence === "high" ? "high" : "draft";
  out("decision", decision);
  out("pr_url", prUrl);
  out("confidence", confidence);
  out("summary", sanitizeOutput(verdict?.summary ?? ""));
  out("risk_notes", sanitizeOutput(verdict?.riskNotes ?? ""));

  logProgress(`decision=${decision} confidence=${confidence}`);
  if (prUrl) {
    logProgress(`pr=${prUrl}`);
  } else if (decision === "escalate") {
    logProgress("no PR opened — would escalate to a human in CI");
  }
  if (verdict?.summary) {
    logProgress(`summary: ${verdict.summary}`);
  }
}

main().catch((err) => {
  if (err instanceof CursorAgentError) {
    console.error(
      `[ci-fix-agent] startup failed: ${err.message} retryable=${err.isRetryable}`,
    );
    process.exit(1);
  }
  throw err;
});
