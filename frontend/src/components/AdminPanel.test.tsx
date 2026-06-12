import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminPanel } from './AdminPanel';
import type { CourtStatusView } from '../types';

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
  {
    id: 2,
    name: 'Court 2',
    surface_type: 'Clay',
    has_lighting: false,
    status: 'maintenance',
    current_reservation: null,
    upcoming_reservations: [],
  },
];

describe('AdminPanel', () => {
  it('renders the current status badge for each court', () => {
    render(<AdminPanel courts={courts} onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('Court 1: available')).toBeInTheDocument();
    expect(screen.getByText('Court 2: maintenance')).toBeInTheDocument();
  });

  it('submits the selected court and status and shows success', async () => {
    const onUpdateStatus = vi.fn().mockResolvedValue(undefined);
    render(<AdminPanel courts={courts} onUpdateStatus={onUpdateStatus} />);

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'unavailable' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update status/i }));

    expect(onUpdateStatus).toHaveBeenCalledWith(1, 'unavailable');
    await waitFor(() =>
      expect(
        screen.getByText('Court status updated successfully.'),
      ).toBeInTheDocument(),
    );
  });

  it('shows an error message when the update fails', async () => {
    const onUpdateStatus = vi
      .fn()
      .mockRejectedValue(new Error('Only admins can change court status.'));
    render(<AdminPanel courts={courts} onUpdateStatus={onUpdateStatus} />);

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /update status/i }));

    await waitFor(() =>
      expect(
        screen.getByText('Only admins can change court status.'),
      ).toBeInTheDocument(),
    );
  });
});
