import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReservationForm } from './ReservationForm';
import type { CourtStatusView } from '../types';

const mockCourts: CourtStatusView[] = [
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
    has_lighting: true,
    status: 'maintenance',
    current_reservation: null,
    upcoming_reservations: [],
  },
];

describe('ReservationForm', () => {
  it('only lists available courts', () => {
    render(
      <ReservationForm
        courts={mockCourts}
        selectedDate="2026-06-15"
        onSubmit={vi.fn()}
      />,
    );

    const options = screen.getAllByRole('option');
    const courtOptions = options.filter((o) => o.textContent?.includes('Court'));

    expect(courtOptions).toHaveLength(1);
    expect(courtOptions[0]).toHaveTextContent('Court 1');
  });

  it('submits reservation data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ReservationForm
        courts={mockCourts}
        selectedDate="2026-06-15"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /book court/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      court_id: 1,
      reservation_date: '2026-06-15',
      start_time: '09:00',
      end_time: '10:00',
    });
  });
});
