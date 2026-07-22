import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReservationList } from './ReservationList';
import type { Member, Reservation } from '../types';

const reservations: Reservation[] = [
  {
    id: 1,
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

const member: Member = {
  id: 1,
  name: 'Alex Rivera',
  email: 'alex@demo.test',
  role: 'member',
};

const admin: Member = {
  id: 2,
  name: 'Morgan Lee',
  email: 'morgan@demo.test',
  role: 'admin',
};

describe('ReservationList', () => {
  it('shows an empty state when there are no reservations', () => {
    render(
      <ReservationList reservations={[]} currentUser={member} onCancel={vi.fn()} />,
    );
    expect(screen.getByText('No reservations for this date.')).toBeInTheDocument();
  });

  it('renders reservation details', () => {
    render(
      <ReservationList
        reservations={reservations}
        currentUser={member}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText('Court 1')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
  });

  it('opens a confirmation modal instead of cancelling immediately', () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    render(
      <ReservationList
        reservations={reservations}
        currentUser={member}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Cancel reservation?')).toBeInTheDocument();
    expect(screen.getByText('2026-06-15')).toBeInTheDocument();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('lets the owner cancel their reservation after confirming', async () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    render(
      <ReservationList
        reservations={reservations}
        currentUser={member}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel reservation' }));

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledWith(1);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('lets an admin cancel any reservation after confirming', async () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    render(
      <ReservationList
        reservations={reservations}
        currentUser={admin}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel reservation' }));

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledWith(1);
    });
  });

  it('keeps the reservation when the user dismisses the modal', async () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    render(
      <ReservationList
        reservations={reservations}
        currentUser={member}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep reservation' }));

    expect(onCancel).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('hides the cancel button for non-owner members', () => {
    const other: Member = { ...member, id: 99 };
    render(
      <ReservationList
        reservations={reservations}
        currentUser={other}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });
});
