---
name: linear-ticket
description: >-
  Start work from a Linear ticket ID: create a ticket-scoped feature branch,
  move the ticket to In Progress at the right moment, and implement (agent mode)
  or plan first then implement (plan mode). Use when the user references a Linear
  ticket (e.g. JWI-123) to work on, or runs /linear-ticket.
disable-model-invocation: true
---

# Work a Linear Ticket

Turn a Linear ticket ID into running work: branch, status, and implementation. Behavior depends on the current mode.

## Inputs

- A ticket ID like `JWI-123`. If none was given, ask for it and stop.
- Linear scope for this repo: team `jwimmer-demos` (key `JWI`), project `Grab a Court`.

## Hard rules

- Never start work on `main` or `master`. All work happens on a ticket-scoped feature branch. See `.cursor/rules/no-direct-main-push.mdc`.
- Move the ticket to **In Progress only when actual code/build work begins** — not while still planning.
- Update status exactly once per transition; do not flip it back and forth.
- Do not commit, push, open a PR, or merge unless the user asks (defer to `commit-push-pr` skill and PR rules).

## Step 1 — Read the ticket

Fetch the ticket so you understand scope before touching anything:

- Use Linear `get_issue` with the ID (e.g. `JWI-123`).
- Capture the title and description; use them to derive the branch slug and the plan.
- If the ticket is already `Done`/`Canceled`, confirm with the user before proceeding.

## Step 2 — Detect mode and branch

### Agent mode → implement now

1. Create the ticket-scoped branch (only if not already on it):

```bash
git checkout -b cursor/jwi-123-<short-slug>
```

Lowercase the ID, derive `<short-slug>` from the title (e.g. `cursor/jwi-142-fix-booking-overlap`).

2. Move the ticket to **In Progress** (see Step 3). Do this as work begins.
3. Implement the change, matching repo patterns (routes → services → repositories).

### Plan mode → plan first

1. Produce the implementation plan from the ticket (files, approach, tests). **Do not** change status yet — planning is not "in progress".
2. The branch and the **In Progress** transition happen at the moment the build actually starts (when leaving plan mode for implementation, or in the follow-up agent-mode run). At that point follow the agent-mode steps above.

## Step 3 — Set status to In Progress

When implementation begins, transition the ticket once:

- Use Linear `save_issue` with `id` = ticket ID and `state` = `In Progress`.
- If unsure of the exact status name, call `list_issue_statuses` with `team: "jwimmer-demos"` and pick the `started`-type status.

```text
save_issue({ id: "JWI-123", state: "In Progress" })
```

Confirm the transition succeeded before continuing to implement.

## Step 4 — Implement and report

- Build the change on the feature branch.
- Run `make lint` / `make test` as appropriate for the change.
- When done, summarize what changed and which ticket/branch it maps to. Leave committing, pushing, and PR creation to the user (use `commit-push-pr`). When that PR is opened, include `Resolves JWI-123` in the body per `.cursor/rules/link-linear` and `pr-template.mdc`.

## Examples

### Agent mode, fresh start

1. User: `/linear-ticket JWI-142`
2. `get_issue JWI-142` → "Fix booking overlap validation"
3. `git checkout -b cursor/jwi-142-fix-booking-overlap`
4. `save_issue({ id: "JWI-142", state: "In Progress" })`
5. Implement in `backend/src/services/bookingService.ts`, run tests, report.

### Plan mode

1. User in plan mode: `/linear-ticket JWI-155`
2. `get_issue JWI-155` → read scope
3. Present a plan. **No** status change, **no** branch yet.
4. User approves and switches to build → create `cursor/jwi-155-<slug>`, set `In Progress`, implement.

### Already on the branch

1. `git branch --show-current` → `cursor/jwi-142-fix-booking-overlap`
2. Skip branch creation; ensure status is `In Progress`; continue implementing.
