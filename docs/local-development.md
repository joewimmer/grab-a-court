# Local Development

## Prerequisites

- Node.js 22.5+ (uses built-in `node:sqlite`)
- npm 10+
- make

## First-Time Setup

```bash
make install
make db-seed
make dev
```

Open http://localhost:5173 in your browser.

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make install` | Install root, frontend, and backend dependencies |
| `make dev` | Seed database and run frontend + backend in development mode |
| `make run` | Build and run the app locally |
| `make db-seed` | Reset and seed the SQLite database |
| `make test` | Run backend and frontend tests |
| `make lint` | Run TypeScript checks |
| `make build` | Build production artifacts |
| `make clean` | Remove build output and database file |

## Development URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Health check | http://localhost:3001/api/health |

## Resetting Demo Data

```bash
make db-seed
```

This drops and recreates `database/grab-a-court.db` with fresh seed data.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `DATABASE_PATH` | `database/grab-a-court.db` | SQLite database file path |

## Project Structure

```
grab-a-court/
├── frontend/          # React Bootstrap UI
├── backend/           # Express API
├── database/          # Schema and SQLite file
├── docs/              # SDLC documentation
├── .github/workflows/ # CI/CD workflows
├── Makefile           # Primary command interface
└── package.json       # npm workspace root
```
