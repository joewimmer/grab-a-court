# AGENTS.md

Instructions for AI agents and developers working in the **Grab A Court** repository.

## Project Summary

Country club tennis court reservation demo app. Members book one of eight courts; admins manage court maintenance status. Built as a production-style SDLC example with a React Bootstrap frontend, Express API, SQLite database, Makefile workflows, and GitHub Actions CI.

| Layer | Stack | Location |
|-------|-------|----------|
| Frontend | Vite, React, TypeScript, Bootstrap | `frontend/` |
| Backend | Express, TypeScript, `node:sqlite` | `backend/` |
| Database | SQLite schema + seed data | `database/` |
| Docs | Architecture, testing, demo script | `docs/` |

## Prerequisites

- **Node.js 22.5+** (required for built-in `node:sqlite`)
- **npm 10+**
- **make**

Verify Node version:

```bash
node --version
```

## Primary Commands (Makefile)

Always prefer Makefile targets from the repo root. They wrap npm workspace scripts and keep local/CI behavior aligned.

```bash
make help        # List all commands
make install     # Install dependencies (root + workspaces)
make db-seed     # Reset and seed SQLite database
make dev         # Seed DB, then run frontend + backend in dev mode
make run         # Build, seed DB, then run in production-like mode
make test        # Run backend and frontend tests
make lint        # TypeScript checks (backend + frontend)
make build       # Production build for both apps
make clean       # Remove build artifacts and database file
```

### First-Time Setup

```bash
make install
make db-seed
make dev
```

`make dev` already runs `db-seed` before starting servers, so `make db-seed` is optional on first launch but useful when you want to reset demo data explicitly.

### Development URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Health check | http://localhost:3001/api/health |

The Vite dev server proxies `/api` to the backend on port 3001.

### Production-Like Local Run

```bash
make run
```

Builds both apps, seeds the database, starts the compiled backend and Vite preview server.

### Reset Demo Data

```bash
make db-seed
```

Drops and recreates `database/grab-a-court.db` with fresh seed data (8 courts, 5 demo users, sample reservations).

### Clean Slate

```bash
make clean
make install
make db-seed
make dev
```

## npm Workspace Alternatives

If Makefile is unavailable, run from the repo root:

```bash
npm install
npm run db:seed
npm run dev
npm run test
npm run lint
npm run build
```

Run a single workspace:

```bash
npm run dev -w backend
npm run dev -w frontend
npm run test -w backend
npm run test -w frontend
```

## Seeding Details

- **Schema:** `database/schema.sql`
- **Seed script:** `backend/scripts/seed.ts` (invoked via `npm run db:seed -w backend`)
- **Database file:** `database/grab-a-court.db` (gitignored; created on seed)
- **Override path:** set `DATABASE_PATH` env var before seeding or starting the server

Seed data includes:

- 8 tennis courts (some `available`, one `maintenance`, one `unavailable`)
- 4 members + 1 admin
- Reservations across today and upcoming days

### Demo Users (select in UI dropdown)

| Name | Role |
|------|------|
| Alex Rivera | member |
| Jordan Kim | member |
| Sam Patel | member |
| Taylor Brooks | member |
| Morgan Lee | admin |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `DATABASE_PATH` | `database/grab-a-court.db` | SQLite database file path |

## Project Structure

```
grab-a-court/
├── frontend/src/           # React UI (components, api client, styles)
├── backend/src/
│   ├── routes/             # Express route handlers
│   ├── services/           # Business rules (bookingService)
│   ├── repositories/       # SQLite queries
│   ├── db/                 # Database connection and schema init
│   └── middleware/         # Demo user auth header handling
├── backend/scripts/seed.ts # Database seed script
├── database/schema.sql     # SQLite schema
├── docs/                   # SDLC documentation
├── .github/workflows/      # CI and release-check workflows
├── Makefile                # Primary command interface
└── package.json            # npm workspace root
```

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/members/demo` | No | List seeded demo users |
| GET | `/api/courts/status?date=YYYY-MM-DD` | No | Eight-court status board |
| GET | `/api/reservations?date=YYYY-MM-DD` | No | Reservations for a date |
| POST | `/api/reservations` | `X-Demo-User-Id` | Create reservation |
| DELETE | `/api/reservations/:id` | `X-Demo-User-Id` | Cancel reservation |
| PATCH | `/api/courts/:id/status` | `X-Demo-User-Id` (admin) | Update court status |

### Demo Authentication

No real login. The frontend stores the selected demo user in `localStorage` and sends `X-Demo-User-Id` on mutating requests. Backend enforces role-based access in `backend/src/middleware/demoUser.ts` and `backend/src/services/bookingService.ts`.

## Business Rules

When changing booking logic, preserve these rules:

- Operating hours: **07:00 to 21:00**
- No overlapping reservations on the same court
- Courts in `maintenance` or `unavailable` cannot be booked
- Members cancel their own reservations; admins cancel any
- Only admins can change court maintenance status

## Testing

```bash
make test
```

| Area | Location | Framework |
|------|----------|-----------|
| Backend unit tests | `backend/src/services/bookingService.test.ts` | Vitest |
| Backend API tests | `backend/src/app.test.ts` | Vitest + Supertest |
| Frontend component tests | `frontend/src/components/*.test.tsx` | Vitest + Testing Library |

Backend tests use an isolated DB at `backend/test-grab-a-court.db` (gitignored via `*.db`).

Before submitting changes, run:

```bash
make lint
make test
make build
```

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **`ci.yml`** — runs on push/PR: `make install`, `make db-seed`, `make lint`, `make test`, `make build`
- **`release-check.yml`** — runs on `main` push or manual dispatch: production build + artifact upload

CI uses Node.js 22.

## Conventions for Agents

1. **Use the Makefile** for install, seed, dev, test, lint, and build unless there is a specific reason not to.
2. **Do not commit** `node_modules/`, `dist/`, `*.db`, or `.env` files (see `.gitignore`).
3. **Keep changes scoped** — match existing patterns in routes → services → repositories.
4. **Frontend styling** — use Bootstrap / React Bootstrap; add custom CSS only in `frontend/src/styles/app.css`.
5. **Database changes** — update `database/schema.sql` and `backend/scripts/seed.ts` together.
6. **Do not edit** plan files in `.cursor/plans/` unless explicitly asked.
7. **Only create git commits** when the user explicitly requests them.

## Additional Documentation

- [README.md](README.md) — quick start and overview
- [docs/architecture.md](docs/architecture.md) — system design and API details
- [docs/local-development.md](docs/local-development.md) — local setup reference
- [docs/testing-strategy.md](docs/testing-strategy.md) — test coverage map
- [docs/demo-script.md](docs/demo-script.md) — customer-facing SDLC walkthrough
