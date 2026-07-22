---
name: commit-push-pr
description: >-
  Stage relevant changes, commit with a short message, push to a feature branch,
  and open a PR (draft only when the user asks). Use when the user asks to
  commit and push, ship changes, or run /commit-push-pr.
disable-model-invocation: true
---

# Commit, Push, and PR

Ship the current work: stage relevant files, commit, push to a feature branch,
then open a PR targeting `main`.

Follow these workspace rules throughout:

- `.cursor/rules/no-direct-main-push.mdc` for branch, push, draft, and merge behavior
- `.cursor/rules/pr-template.mdc` for PR titles and descriptions

Additional skill-specific constraints:

- Never skip hooks or use `git reset --hard`.
- Stage only relevant paths. Do not use `git add .` or `git add -A` unless the
  user explicitly asks to commit everything.
- Skip sensitive or ignored files such as `.env`, credentials, `*.db`,
  `node_modules/`, and build artifacts.

## Step 1 — Inspect state

Run in parallel:

```bash
git branch --show-current
git status
git diff
git diff --staged
git log -5 --oneline
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || true
```

Summarize what will be committed before staging. If the working tree is clean and there is nothing to push, report and stop.

## Step 2 — Ensure feature branch

Follow `.cursor/rules/no-direct-main-push.mdc`. Derive the branch slug from the
change.

## Step 3 — Stage relevant changes

- Stage files relevant to the current work (conversation context + diff review).
- Use explicit paths: `git add <path>...`
- Respect already-staged hunks; add unstaged files that belong to the same change set.
- If nothing relevant to stage, stop and tell the user.

## Step 4 — Commit

Match repo style: imperative one-liner, 1–2 sentences focused on **why**.

```bash
git commit -m "$(cat <<'EOF'
Short imperative summary.

Optional second sentence for context.
EOF
)"
```

On hook failure: fix the issue and create a **new** commit (no `--amend` unless amend rules apply).

## Step 5 — Push

- No upstream: `git push -u origin HEAD`
- Upstream exists and branch is ahead: `git push`

Report branch name, commit SHA, and tracking status.

## Step 6 — Open PR

After a successful push, open a PR targeting `main` without asking whether to
create one.

1. Check for an existing PR: `gh pr view --json url,number 2>/dev/null`.
2. If one exists, return its URL instead of creating a duplicate.
3. Otherwise create the PR using `.cursor/rules/pr-template.mdc`.
4. Use `--draft` only when the user explicitly requested a draft.
5. Return the PR URL.
