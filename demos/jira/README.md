# Jira demo ticket catalog

This directory archives the Grab A Court enablement ticket set so it can be reset before each live session.

## Files

| File | Purpose |
|------|---------|
| [`grab-a-court.yaml`](grab-a-court.yaml) | Canonical ticket definitions for the `JOE` / Joe Wimmer Demos project |

## Catalog schema

```yaml
catalog:
  cloud_id: fe-anysphere-demo.atlassian.net
  site_url: https://fe-anysphere-demo.atlassian.net
  project_key: JOE
  project_name: Joe Wimmer Demos

tickets:
  - key: stable-slug-for-docs
    title: Exact Jira issue summary
    issue_type: Bug        # or Feature
    priority: Medium       # or Low
    description: |
      Markdown body for the Jira issue description
```

### Field notes

- **`key`** — Stable identifier for docs and branch slugs. Never store Jira issue keys here; each reset creates fresh `JOE-<number>` issues.
- **`title`** — Must match exactly when matching or recreating issues (Jira summary).
- **`issue_type`** — `Bug` or `Feature` (JOE project issue types).
- **`priority`** — Jira priority name (`Medium` or `Low`).
- **`description`** — Full Markdown body, including acceptance criteria and implementation hints.

## Reset workflow

Use the project skill [`.cursor/skills/reset-enablement-demo/SKILL.md`](../../.cursor/skills/reset-enablement-demo/SKILL.md) (invoke with `/reset-enablement-demo`).

On each reset the skill:

1. Confirms the blast radius (issues, PRs, branches) before writing.
2. Transitions unresolved issues in the `JOE` project to **Done**.
3. Recreates every ticket from `grab-a-court.yaml` in **To Do**.
4. Closes open demo PRs without merging.
5. Deletes matching local and remote demo branches (`cursor/joe-*`, `joewimmer/joe-*`).

`main` is never modified.

## Working a ticket during a session

After reset, use [`.cursor/skills/jira-ticket/SKILL.md`](../../.cursor/skills/jira-ticket/SKILL.md) to branch and implement from a `JOE-<number>` ticket. Demo branches follow:

```text
cursor/joe-<number>-<short-slug>
```

PRs may be opened for demo purposes but are not merged.

## Verification

After a reset, confirm:

- [ ] `JOE` has exactly the tickets defined in `grab-a-court.yaml`, all in To Do
- [ ] No open PRs on `cursor/joe-*` or `joewimmer/joe-*` branches
- [ ] No leftover local or remote demo branches for those patterns
- [ ] `main` is clean and unchanged

## Editing the catalog

When adding or updating demo tickets:

1. Edit `grab-a-court.yaml` — one entry per ticket, unique `key` and `title`.
2. Run the reset skill before the next session so Jira matches the file.
3. Keep tickets frontend-only and implementable in a few minutes for live enablement.
