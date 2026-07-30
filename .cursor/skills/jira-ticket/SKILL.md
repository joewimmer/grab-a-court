---
name: jira-ticket
description: >-
  Start work from a Jira ticket ID: create a ticket-scoped feature branch,
  move the ticket to In Progress at the right moment, and implement (agent mode)
  or plan first then implement (plan mode). Use when the user references a Jira
  ticket (e.g. JOE-123) to work on, or runs /jira-ticket.
disable-model-invocation: true
---

# Work a Jira Ticket

Turn a Jira ticket ID into running work: branch, status, and implementation. Behavior depends on the current mode.

## Inputs

- A ticket key like `JOE-123`. If none was given, ask for it and stop.
- Jira scope for this repo: project [`JOE`](https://fe-anysphere-demo.atlassian.net/browse/JOE) (Joe Wimmer Demos) on `fe-anysphere-demo.atlassian.net`.
- Demo ticket definitions live in [`demos/jira/grab-a-court.yaml`](../../demos/jira/grab-a-court.yaml). Reset the set with [`reset-enablement-demo`](../reset-enablement-demo/SKILL.md) before a new session.

## Hard rules

- Never start work on `main` or `master`. All work happens on a ticket-scoped feature branch. See `.cursor/rules/no-direct-main-push.mdc`.
- Move the ticket to **In Progress only when actual code/build work begins** — not while still planning.
- Update status exactly once per transition; do not flip it back and forth.
- Do not commit, push, open a PR, or merge unless the user asks (defer to `commit-push-pr` skill and PR rules).
- Demo PRs are for enablement only — never merge them unless the user explicitly asks.

## Step 1 — Read the ticket

Fetch the ticket so you understand scope before touching anything:

- Use Atlassian MCP `getJiraIssue` with `cloudId: "fe-anysphere-demo.atlassian.net"` and `issueIdOrKey` (e.g. `JOE-123`).
- Capture the summary and description; use them to derive the branch slug and the plan.
- If the ticket is already `Done`, confirm with the user before proceeding.

## Step 2 — Detect mode and branch

### Agent mode → implement now

1. Create the ticket-scoped branch (only if not already on it):

```bash
git checkout -b cursor/joe-123-<short-slug>
```

Lowercase the key, derive `<short-slug>` from the title (e.g. `cursor/joe-1-prevent-past-dates`).

2. Move the ticket to **In Progress** (see Step 3). Do this as work begins.
3. Implement the change, matching repo patterns (routes → services → repositories).

### Plan mode → plan first

1. Produce the implementation plan from the ticket (files, approach, tests). **Do not** change status yet — planning is not "in progress".
2. The branch and the **In Progress** transition happen at the moment the build actually starts (when leaving plan mode for implementation, or in the follow-up agent-mode run). At that point follow the agent-mode steps above.

## Step 3 — Set status to In Progress

When implementation begins, transition the ticket once:

- `getTransitionsForJiraIssue` with `issueIdOrKey` = ticket key.
- Find the transition whose `to.name` is `In Progress` (typically transition id `21` on this project).
- `transitionJiraIssue` with `transition: { id: "<in-progress-transition-id>" }`.

```text
getTransitionsForJiraIssue({ cloudId: "fe-anysphere-demo.atlassian.net", issueIdOrKey: "JOE-123" })
transitionJiraIssue({ cloudId: "fe-anysphere-demo.atlassian.net", issueIdOrKey: "JOE-123", transition: { id: "21" } })
```

Confirm the transition succeeded before continuing to implement.

## Step 4 — Implement and report

- Build the change on the feature branch.
- Run `make lint` / `make test` as appropriate for the change.
- When done, summarize what changed and which ticket/branch it maps to. Leave committing, pushing, and PR creation to the user (use `commit-push-pr`). When that PR is opened, include `Resolves JOE-123` in the body per `.cursor/rules/pr-template.mdc`.

## Examples

### Agent mode, fresh start

1. User: `/jira-ticket JOE-1`
2. `getJiraIssue JOE-1` → "Prevent selecting past reservation dates"
3. `git checkout -b cursor/joe-1-prevent-past-dates`
4. Transition to In Progress
5. Implement in `frontend/src/App.tsx`, run tests, report.

### Plan mode

1. User in plan mode: `/jira-ticket JOE-2`
2. `getJiraIssue JOE-2` → read scope
3. Present a plan. **No** status change, **no** branch yet.
4. User approves and switches to build → create `cursor/joe-2-confirm-cancel`, set In Progress, implement.

### Already on the branch

1. `git branch --show-current` → `cursor/joe-1-prevent-past-dates`
2. Skip branch creation; ensure status is In Progress; continue implementing.

## Session reset

Before a new enablement session, run [`reset-enablement-demo`](../reset-enablement-demo/SKILL.md) to close/recreate tickets, close demo PRs, and delete demo branches.
