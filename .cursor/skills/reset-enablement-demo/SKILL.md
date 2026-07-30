---
name: reset-enablement-demo
description: >-
  Reset the Grab a Court enablement session to a clean baseline: close and
  recreate Jira demo tickets from demos/jira/grab-a-court.yaml, close demo
  PRs without merging, and delete demo branches. Use when the user asks to reset
  the enablement demo or runs /reset-enablement-demo.
disable-model-invocation: true
---

# Reset Enablement Demo

Restore a clean baseline before or after a live enablement session. Jira tickets match the archived catalog, demo PRs are closed (never merged), and leftover demo branches are removed.

## Catalog

Read [`demos/jira/grab-a-court.yaml`](../../demos/jira/grab-a-court.yaml) for project and ticket definitions. See [`demos/jira/README.md`](../../demos/jira/README.md) for schema details.

## Hard rules

- **Confirm before any destructive action.** Show the full blast radius and wait for explicit user approval.
- **Never merge PRs.**
- **Never push to, commit on, or delete `main` / `master`.** See `.cursor/rules/no-direct-main-push.mdc`.
- **Never delete branches outside the demo patterns** (`cursor/joe-*`, `joewimmer/joe-*`, and leftover `cursor/dem2-*` / `joewimmer/dem2-*`).
- **Never force-push** or run `git reset --hard`.
- Close/recreate Jira issues only in the `JOE` project (`Joe Wimmer Demos` on `fe-anysphere-demo.atlassian.net`).

## Step 1 — Inspect current state

Gather everything before proposing changes:

### Jira

Use the Atlassian MCP (`plugin-atlassian-atlassian`). Cloud ID / site: `fe-anysphere-demo.atlassian.net` (from catalog `cloud_id`).

- `getVisibleJiraProjects` with `searchString: "JOE"` (or `cloudId` + browse) — confirm the `JOE` project exists.
- `searchJiraIssuesUsingJql` with:
  - `jql: "project = JOE AND resolution = Unresolved ORDER BY key ASC"`
  - `fields: ["summary", "status", "issuetype", "priority"]`
  - List unresolved issues to close.
- Load fixture titles from `demos/jira/grab-a-court.yaml`.

### Git / GitHub

Run in parallel:

```bash
git branch --show-current
git branch --list 'cursor/joe-*' 'cursor/dem2-*'
git branch --remotes --list 'origin/cursor/joe-*' 'origin/joewimmer/joe-*' 'origin/cursor/dem2-*' 'origin/joewimmer/dem2-*'
gh pr list --state open --json number,title,headRefName,url
```

Demo PRs are open PRs whose `headRefName` matches:

- `cursor/joe-*`
- `joewimmer/joe-*`
- leftover `cursor/dem2-*` / `joewimmer/dem2-*` from prior Linear sessions

## Step 2 — Present confirmation

Show a summary like:

```text
Enablement reset plan

Jira (JOE / Joe Wimmer Demos):
  Done: JOE-4 Navbar brand icon looks like a soccer ball
  Done: JOE-3 Add a refresh button...
  Recreate: 11 tickets from demos/jira/grab-a-court.yaml → To Do

GitHub PRs to close (no merge):
  #19 Remove dark mode toggle (cursor/joe-4-...)

Branches to delete:
  local:  cursor/joe-4-navbar-brand-icon
  remote: origin/cursor/joe-4-navbar-brand-icon

main will not be modified.
```

**Stop and wait for explicit approval** before Step 3.

## Step 3 — Jira reset

1. **Confirm project exists.** If `JOE` is missing, stop and tell the user — do not invent a new project; create it in Jira UI or ask for access first.
2. **Close unresolved project issues.** For each unresolved issue from Step 1:
   - `getTransitionsForJiraIssue` with `issueIdOrKey` (e.g. `JOE-4`)
   - Find the transition whose `to.name` is `Done` (typically transition id `41` on this project)
   - `transitionJiraIssue` with `transition: { id: "<done-transition-id>" }`
3. **Recreate fixtures.** For each entry in `tickets:` from the YAML, `createJiraIssue` with:
   - `cloudId`: catalog `cloud_id`
   - `projectKey`: `JOE`
   - `issueTypeName`: catalog `issue_type` (`Bug` or `Feature`)
   - `summary`: catalog `title`
   - `description`: catalog `description` (Markdown; `contentFormat: "markdown"`)
   - `additional_fields`: `{ "priority": { "name": "<Medium|Low>" } }` from catalog `priority`
4. Record the new issue URLs (`JOE-<number>` → `https://fe-anysphere-demo.atlassian.net/browse/JOE-<number>`).

## Step 4 — Close demo PRs

For each open demo PR from Step 1:

```bash
gh pr close <number>
```

Do not use `--merge`. If a PR is already closed, skip it.

## Step 5 — Delete demo branches

Ensure you are on `main` (or another safe branch — not a branch being deleted):

```bash
git checkout main
git pull --ff-only origin main
```

Delete local demo branches:

```bash
git branch -D cursor/joe-<slug>   # for each matching local branch
git branch -D cursor/dem2-<slug>  # leftover Linear-era branches, if any
```

Delete remote demo branches:

```bash
git push origin --delete cursor/joe-<slug>
git push origin --delete joewimmer/joe-<slug>
git push origin --delete cursor/dem2-<slug>      # leftover, if any
git push origin --delete joewimmer/dem2-<slug>   # leftover, if any
```

Skip branches that do not exist. Never delete `main`.

## Step 6 — Report

Return a concise summary:

- Closed Jira issues (old keys)
- Newly created Jira issues (new keys + URLs)
- Closed PRs (numbers + URLs)
- Deleted branches (local and remote)
- Reminder: use `/jira-ticket JOE-<n>` to start work; PRs are for demo only and should not be merged

## Examples

### Full reset before a session

1. User: `/reset-enablement-demo`
2. Inspect Jira issues, open PRs, and `cursor/joe-*` branches.
3. Present plan; user confirms.
4. Transition 11 unresolved issues to Done, recreate 11 from YAML.
5. Close 2 open demo PRs.
6. Delete 3 local and 3 remote demo branches.
7. Report fresh `JOE-*` links.

### Nothing to clean up

1. No unresolved issues, no open demo PRs, no demo branches.
2. Still recreate tickets from YAML if the project has no open fixtures.
3. Report created issues only.

### User declines confirmation

1. Present plan in Step 2.
2. User says no → stop. Report that no changes were made.

## Related skills

- [`jira-ticket`](../jira-ticket/SKILL.md) — branch and implement from a `JOE-<number>` ticket during the session.
- [`commit-push-pr`](../commit-push-pr/SKILL.md) — commit, push, and optionally open a demo PR (never merge).
