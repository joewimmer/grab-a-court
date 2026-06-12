# Customer Demo Script

Use this script to walk customers through the full SDLC lifecycle demonstrated by Grab A Court.

## 1. Requirements (2 min)

"We built a country club tennis court reservation system. Members can book one of eight courts, view live availability, and admins can manage court maintenance."

Key requirements covered:
- Eight tennis courts with live status
- Member reservations with conflict prevention
- Admin maintenance controls
- Seeded demo data for immediate UI value

## 2. Architecture (2 min)

Show `docs/architecture.md` or the README architecture summary:

- React Bootstrap frontend
- Express TypeScript backend
- SQLite database
- Makefile for consistent local commands
- GitHub Actions for CI/CD

## 3. Local Development (3 min)

```bash
make install
make db-seed
make dev
```

Highlight:
- One-command setup via Makefile
- Seed data populates courts, members, and reservations
- Frontend at http://localhost:5173

## 4. Member Experience (3 min)

1. Select **Alex Rivera (member)** from the demo user dropdown
2. Show the **Court Status Board** with eight courts
3. Point out courts in different states (available, maintenance, unavailable)
4. Book an available court for today
5. Show the reservation in **My Reservations**
6. Cancel a reservation

## 5. Admin Experience (2 min)

1. Switch to **Morgan Lee (admin)**
2. Show **All Reservations** view
3. Open **Admin: Court Maintenance**
4. Set a court to maintenance and show it disappear from booking options
5. Set it back to available

## 6. Quality Gates (2 min)

```bash
make test
make lint
make build
```

Show `.github/workflows/ci.yml` and `release-check.yml`:
- Automated lint, test, and build on every PR
- Release readiness check on main with artifact upload

## 7. Deployment Readiness (1 min)

"We have production builds for both frontend and backend, automated quality checks, seeded data for demos, and documentation for onboarding new developers."

## Talking Points

- **Monorepo** keeps frontend and backend in sync
- **Makefile** gives operators a simple interface
- **SQLite** keeps local setup lightweight
- **Bootstrap** delivers a polished UI quickly
- **GitHub Actions** demonstrates CI/CD without extra infrastructure
