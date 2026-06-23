import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CourtStatusView, Member, Reservation } from './types';

const members: Member[] = [
  { id: 1, name: 'Alex Rivera', email: 'alex@demo.test', role: 'member' },
  { id: 2, name: 'Morgan Lee', email: 'morgan@demo.test', role: 'admin' },
];

const courts: CourtStatusView[] = [
  {
    id: 1,
    name: 'Court 1',
    surface_type: 'Hard',
    has_lighting: true,
    status: 'available',
    current_reservation: null,
    upcoming_reservations: [],
  },
];

const reservations: Reservation[] = [
  {
    id: 10,
    court_id: 1,
    member_id: 1,
    reservation_date: '2026-06-15',
    start_time: '09:00',
    end_time: '10:00',
    status: 'confirmed',
    court_name: 'Court 1',
    member_name: 'Alex Rivera',
  },
];

const mocks = vi.hoisted(() => ({
  fetchDemoMembers: vi.fn(),
  fetchCourtStatus: vi.fn(),
  fetchReservations: vi.fn(),
  createReservation: vi.fn(),
  cancelReservation: vi.fn(),
  updateCourtStatus: vi.fn(),
  getStoredDemoUser: vi.fn(),
  setStoredDemoUser: vi.fn(),
}));

vi.mock('./api/client', () => mocks);

import App from './App';

describe('App', () => {
  beforeEach(() => {
    mocks.getStoredDemoUser.mockReturnValue(null);
    mocks.setStoredDemoUser.mockImplementation(() => {});
    mocks.fetchDemoMembers.mockResolvedValue(members);
    mocks.fetchCourtStatus.mockResolvedValue(courts);
    mocks.fetchReservations.mockResolvedValue(reservations);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads members and selects the first one by default', async () => {
    render(<App />);

    await waitFor(() => expect(mocks.fetchDemoMembers).toHaveBeenCalled());
    expect(mocks.setStoredDemoUser).toHaveBeenCalledWith(members[0]);
    expect(await screen.findByText('alex@demo.test')).toBeInTheDocument();
  });

  it('renders the court status board after loading', async () => {
    render(<App />);
    const heading = await screen.findByText('Court Status Board');
    const card = heading.closest('.card') as HTMLElement;
    expect(within(card).getByText('Court 1')).toBeInTheDocument();
  });

  it('shows the admin panel only for admin users', async () => {
    mocks.getStoredDemoUser.mockReturnValue(members[1]);
    render(<App />);

    expect(await screen.findByText(/Admin: Court Maintenance/)).toBeInTheDocument();
  });

  it('shows an error alert when loading data fails', async () => {
    mocks.fetchCourtStatus.mockRejectedValue(new Error('Failed to load data'));
    render(<App />);

    expect(await screen.findByText('Failed to load data')).toBeInTheDocument();
  });

  it('filters reservations to the current member for non-admins', async () => {
    mocks.getStoredDemoUser.mockReturnValue(members[0]);
    render(<App />);

    const heading = await screen.findByText('My Reservations');
    const card = heading.closest('.card') as HTMLElement;
    expect(within(card).getByText('Court 1')).toBeInTheDocument();
  });

  it('narrows the court status board when a court type filter is applied', async () => {
    mocks.fetchCourtStatus.mockResolvedValue([
      {
        id: 1,
        name: 'Court 1',
        surface_type: 'Hard',
        has_lighting: true,
        status: 'available',
        current_reservation: null,
        upcoming_reservations: [],
      },
      {
        id: 2,
        name: 'Court 2',
        surface_type: 'Clay',
        has_lighting: false,
        status: 'available',
        current_reservation: null,
        upcoming_reservations: [],
      },
    ]);

    render(<App />);

    const heading = await screen.findByText('Court Status Board');
    const card = heading.closest('.card') as HTMLElement;
    expect(within(card).getByText('Court 1')).toBeInTheDocument();
    expect(within(card).getByText('Court 2')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Hard'));

    expect(within(card).getByText('Court 1')).toBeInTheDocument();
    expect(within(card).queryByText('Court 2')).not.toBeInTheDocument();
  });
});
