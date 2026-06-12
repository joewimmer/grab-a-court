# Testing Strategy

## Goals

The test suite demonstrates SDLC quality gates without over-engineering the demo app.

## Backend Tests

Location: `backend/src/**/*.test.ts`

### Unit Tests (`bookingService.test.ts`)

- Time range validation within operating hours
- Overlap detection for reservations
- Maintenance court booking rejection

### API Tests (`app.test.ts`)

- Health endpoint
- Demo members listing
- Reservation create and list flow
- Court status board
- Admin-only court status updates

Backend tests use an isolated SQLite database file (`backend/test-grab-a-court.db`) that is created and torn down per test run.

## Frontend Tests

Location: `frontend/src/**/*.test.tsx`

### Component Tests

- `CourtStatusGrid.test.tsx` - renders courts, shows active reservations and maintenance status
- `ReservationForm.test.tsx` - filters available courts and submits booking data

Frontend tests use Vitest with jsdom and React Testing Library.

## Running Tests

```bash
make test
```

With coverage (generates `coverage/` in each workspace):

```bash
make test-coverage
```

Or individually:

```bash
npm run test -w backend
npm run test -w frontend
npm run test:coverage -w backend
npm run test:coverage -w frontend
```

## Coverage

Vitest collects coverage via `@vitest/coverage-v8`. Reports are written to `backend/coverage/` and `frontend/coverage/` (gitignored). CI uploads merged `lcov.info` files to [Codecov](https://codecov.io) for badges and pull request diffs.

Codecov is free for public repositories. Connect the repo at codecov.io, then add the repository upload token as a `CODECOV_TOKEN` GitHub Actions secret (Settings → Secrets and variables → Actions). The CI workflow passes this token to the Codecov action.

## CI Integration

GitHub Actions runs the full test suite on every push and pull request via the `CI` workflow:

1. Install dependencies
2. Seed database
3. Lint
4. Test with coverage (upload to Codecov)
5. Build
