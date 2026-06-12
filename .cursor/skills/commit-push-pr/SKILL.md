---
name: commit-push-pr
description: >-
  Stage relevant changes, commit with a short message, push to a feature branch,
  and optionally open a draft PR. Use when the user asks to commit and push,
  ship changes, or run /commit-push-pr.
disable-model-invocation: true
---

# Commit, Push, and Optional Draft PR

Ship the current work: stage relevant files, commit, push to a feature branch, then ask whether to open a draft PR.

## Hard rules

- Never commit or push on `main` or `master`. See `.cursor/rules/no-direct-main-push.mdc`.
- Never `git push origin main`, `git push origin master`, force-push, `reset --hard`, or skip hooks.
- Stage only relevant paths. No `git add .` / `git add -A` unless the user explicitly asks to commit everything.
- Skip sensitive or gitignored files (`.env`, credentials, `*.db`, `node_modules/`, etc.).
- Draft PR by default. Ready-for-review only if the user asks later. See `.cursor/rules/pr-template.mdc`.
- Do not merge a PR unless the user explicitly asks.

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

If on `main` or `master`, create and switch first:

```bash
git checkout -b cursor/<short-description>
```

Derive `<short-description>` from the change (e.g. `add-docker-compose`, `fix-booking-overlap`).

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

## Step 6 — Ask about draft PR

**Required pause.** Use AskQuestion (or ask in chat) before creating a PR:

> Push complete on `<branch>`. Open a **draft** PR targeting `main`?

**If no:** Stop. Report the branch and remote (`git remote get-url origin`). The user can invoke this skill again later.

**If yes:**

1. Check for an existing PR: `gh pr view --json url,number 2>/dev/null`
2. If one exists, return its URL instead of creating a duplicate.
3. Otherwise follow `.cursor/rules/pr-template.mdc`:

```bash
gh pr create --draft --title "<short imperative title>" --body "$(cat <<'EOF'
## Summary

- <what changed and why>

## Test plan

- [ ] `make lint`
- [ ] `make test`
- [ ] `make build`

EOF
)"
```

Return the PR URL.

## Examples

### Uncommitted work on main

1. `git branch --show-current` → `main`
2. `git checkout -b cursor/add-commit-push-pr-skill`
3. `git add .cursor/skills/commit-push-pr/SKILL.md`
4. Commit: `Add commit-push-pr skill for ship workflow.`
5. `git push -u origin HEAD`
6. Ask: draft PR? → if yes, `gh pr create --draft ...`

### Already on a feature branch with upstream

1. On `cursor/add-docker-compose`, upstream set, one modified file
2. `git add Makefile docker-compose.yml`
3. Commit and `git push`
4. Ask: draft PR?

### PR already exists

1. After push, `gh pr view --json url` returns a URL
2. Report: "PR already open: <url>" — do not run `gh pr create` again

### Clean working tree

1. `git status` shows nothing to commit, branch up to date with origin
2. Report clean state and stop (skip commit, push, and PR prompt unless user only wanted a PR for existing commits)
