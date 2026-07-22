# Linear demo ticket catalog

This directory archives the Grab A Court enablement ticket set so it can be reset before each live session.

## Files

| File | Purpose |
|------|---------|
| [`grab-a-court.yaml`](grab-a-court.yaml) | Canonical ticket definitions for the `DEM2` / `Grab a Court` demo set |

## Catalog schema

```yaml
catalog:
  team_key: DEM2
  team_name: demos
  project: Grab a Court
  project_summary: ...
  project_description: ...

tickets:
  - key: stable-slug-for-docs
    title: Exact Linear issue title
    labels:
      - Bug            # or type:feature
    priority: 3         # 3 = Medium, 4 = Low
    description: |
      Markdown body copied from Linear
```

### Field notes

- **`key`** — Stable identifier for docs and branch slugs. Never store Linear issue IDs here; each reset creates fresh `DEM2-<number>` issues.
- **`title`** — Must match exactly when matching or recreating issues.
- **`labels`** — Use `Bug` or `type:feature` as configured on the `demos` team.
- **`priority`** — Linear numeric priority (`3` = Medium, `4` = Low).
- **`description`** — Full Markdown body, including acceptance criteria and implementation hints.

## Reset workflow

Use the project skill [`.cursor/skills/reset-enablement-demo/SKILL.md`](../../.cursor/skills/reset-enablement-demo/SKILL.md) (invoke with `/reset-enablement-demo`).

On each reset the skill:

1. Confirms the blast radius (issues, PRs, branches) before writing.
2. Cancels active issues in the `Grab a Court` project.
3. Recreates every ticket from `grab-a-court.yaml` in **Backlog**.
4. Closes open demo PRs without merging.
5. Deletes matching local and remote demo branches (`cursor/dem2-*`, `joewimmer/dem2-*`).

`main` is never modified.

## Working a ticket during a session

After reset, use [`.cursor/skills/linear-ticket/SKILL.md`](../../.cursor/skills/linear-ticket/SKILL.md) to branch and implement from a `DEM2-<number>` ticket. Demo branches follow:

```text
cursor/dem2-<number>-<short-slug>
```

PRs may be opened for demo purposes but are not merged.

## Verification

After a reset, confirm:

- [ ] `Grab a Court` has exactly the tickets defined in `grab-a-court.yaml`, all in Backlog
- [ ] No open PRs on `cursor/dem2-*` or `joewimmer/dem2-*` branches
- [ ] No leftover local or remote demo branches for those patterns
- [ ] `main` is clean and unchanged

## Editing the catalog

When adding or updating demo tickets:

1. Edit `grab-a-court.yaml` — one entry per ticket, unique `key` and `title`.
2. Run the reset skill before the next session so Linear matches the file.
3. Keep tickets frontend-only and implementable in a few minutes for live enablement.
