---
name: reset-enablement-demo
description: >-
  Reset the Grab a Court enablement session to a clean baseline: cancel and
  recreate Linear demo tickets from demos/linear/grab-a-court.yaml, close demo
  PRs without merging, and delete demo branches. Use when the user asks to reset
  the enablement demo or runs /reset-enablement-demo.
disable-model-invocation: true
---

# Reset Enablement Demo

Restore a clean baseline before or after a live enablement session. Linear tickets match the archived catalog, demo PRs are closed (never merged), and leftover demo branches are removed.

## Catalog

Read [`demos/linear/grab-a-court.yaml`](../../demos/linear/grab-a-court.yaml) for team, project, and ticket definitions. See [`demos/linear/README.md`](../../demos/linear/README.md) for schema details.

## Hard rules

- **Confirm before any destructive action.** Show the full blast radius and wait for explicit user approval.
- **Never merge PRs.**
- **Never push to, commit on, or delete `main` / `master`.** See `.cursor/rules/no-direct-main-push.mdc`.
- **Never delete branches outside the demo patterns** (`cursor/dem2-*`, `joewimmer/dem2-*`).
- **Never force-push** or run `git reset --hard`.
- Cancel/recreate Linear issues only in the `Grab a Court` project on team `DEM2`.

## Step 1 — Inspect current state

Gather everything before proposing changes:

### Linear

- `list_projects` with `team: "DEM2"` and `query: "Grab a Court"` — note project ID or confirm it must be created.
- `list_issues` with `team: "DEM2"`, `project: "Grab a Court"`, `includeArchived: false` — list active issues.
- Load fixture titles from `demos/linear/grab-a-court.yaml`.

### Git / GitHub

Run in parallel:

```bash
git branch --show-current
git branch --list 'cursor/dem2-*'
git branch --remotes --list 'origin/cursor/dem2-*' 'origin/joewimmer/dem2-*'
gh pr list --state open --json number,title,headRefName,url
```

Demo PRs are open PRs whose `headRefName` matches:

- `cursor/dem2-*`
- `joewimmer/dem2-*`

## Step 2 — Present confirmation

Show a summary like:

```text
Enablement reset plan

Linear (Grab a Court / DEM2):
  Cancel: DEM2-3 Navbar brand icon looks like a soccer ball
  Cancel: DEM2-4 Add a refresh button...
  Recreate: 11 tickets from demos/linear/grab-a-court.yaml → Backlog

GitHub PRs to close (no merge):
  #19 Remove dark mode toggle (cursor/dem2-3-...)

Branches to delete:
  local:  cursor/dem2-3-navbar-brand-icon
  remote: origin/cursor/dem2-3-navbar-brand-icon

main will not be modified.
```

**Stop and wait for explicit approval** before Step 3.

## Step 3 — Linear reset

1. **Ensure project exists.** If missing, `save_project` with values from the catalog `catalog:` block and `setTeams: ["DEM2"]`.
2. **Cancel active project issues.** For each active issue in `Grab a Court`, `save_issue` with `state: "Canceled"` (or `"Cancelled"` — call `list_issue_statuses` with `team: "DEM2"` if unsure and pick the `canceled`-type status).
3. **Recreate fixtures.** For each entry in `tickets:` from the YAML, `save_issue` with:
   - `team: "DEM2"`
   - `project: "Grab a Court"`
   - `state: "Backlog"`
   - `title`, `description`, `labels`, `priority` from the catalog
4. Record the new issue URLs (`DEM2-<number>`).

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
git branch -D cursor/dem2-<slug>   # for each matching local branch
```

Delete remote demo branches:

```bash
git push origin --delete cursor/dem2-<slug>
git push origin --delete joewimmer/dem2-<slug>
```

Skip branches that do not exist. Never delete `main`.

## Step 6 — Report

Return a concise summary:

- Canceled Linear issues (old IDs)
- Newly created Linear issues (new IDs + URLs)
- Closed PRs (numbers + URLs)
- Deleted branches (local and remote)
- Reminder: use `/linear-ticket DEM2-<n>` to start work; PRs are for demo only and should not be merged

## Examples

### Full reset before a session

1. User: `/reset-enablement-demo`
2. Inspect Linear issues, open PRs, and `cursor/dem2-*` branches.
3. Present plan; user confirms.
4. Cancel 11 active issues, recreate 11 from YAML.
5. Close 2 open demo PRs.
6. Delete 3 local and 3 remote demo branches.
7. Report fresh `DEM2-14` through `DEM2-24` links.

### Nothing to clean up

1. No active issues, no open demo PRs, no demo branches.
2. Still recreate tickets from YAML if the project is empty.
3. Report created issues only.

### User declines confirmation

1. Present plan in Step 2.
2. User says no → stop. Report that no changes were made.

## Related skills

- [`linear-ticket`](../linear-ticket/SKILL.md) — branch and implement from a `DEM2-<number>` ticket during the session.
- [`commit-push-pr`](../commit-push-pr/SKILL.md) — commit, push, and optionally open a demo PR (never merge).
