# Grab A Court

A production-style demo application for country clubs that want to let members reserve tennis courts. The app shows live status for eight courts, supports member reservations, and includes admin maintenance controls.

## Stack

- **Frontend:** Vite, React, TypeScript, Bootstrap
- **Backend:** Express, TypeScript, SQLite (`node:sqlite`)
- **Tooling:** Makefile, npm workspaces, GitHub Actions

## Quick Start

```bash
make install
make db-seed
make dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make install` | Install all dependencies |
| `make dev` | Run frontend and backend in development mode |
| `make run` | Build and run the app locally |
| `make db-seed` | Create/reset and seed the SQLite database |
| `make test` | Run all tests |
| `make lint` | Run lint checks |
| `make build` | Build frontend and backend |

## Demo Users

After seeding, select a demo user in the UI:

- **Members:** Alex Rivera, Jordan Kim, Sam Patel, Taylor Brooks
- **Admin:** Morgan Lee (can manage court maintenance status)

## Documentation

See the [docs/](docs/) folder for architecture, local development, testing strategy, and customer demo script.
