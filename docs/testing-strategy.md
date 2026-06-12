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

Or individually:

```bash
npm run test -w backend
npm run test -w frontend
```

## CI Integration

GitHub Actions runs the full test suite on every push and pull request via the `CI` workflow:

1. Install dependencies
2. Seed database
3. Lint
4. Test
5. Build
