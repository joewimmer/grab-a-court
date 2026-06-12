import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReservationForm } from './ReservationForm';
import type { CourtStatusView, Reservation } from '../types';

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

const mockReservations: Reservation[] = [
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

describe('ReservationForm', () => {
  it('only lists available courts', () => {
    render(
      <ReservationForm
        courts={mockCourts}
        reservations={mockReservations}
        selectedDate="2026-06-15"
        onSubmit={vi.fn()}
      />,
    );

    const options = screen.getAllByRole('option');
    const courtOptions = options.filter((o) => o.textContent?.includes('Court'));

    expect(courtOptions).toHaveLength(1);
    expect(courtOptions[0]).toHaveTextContent('Court 1');
  });

  it('hides start times that overlap existing reservations', () => {
    render(
      <ReservationForm
        courts={mockCourts}
        reservations={mockReservations}
        selectedDate="2026-06-15"
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });

    const startOptions = screen
      .getByLabelText('Start Time')
      .querySelectorAll('option');
    const startValues = Array.from(startOptions).map((option) => option.textContent);

    expect(startValues).not.toContain('09:00');
    expect(startValues).toContain('10:00');
  });

  it('submits reservation data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ReservationForm
        courts={mockCourts}
        reservations={mockReservations}
        selectedDate="2026-06-15"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Start Time'), {
      target: { value: '10:00' },
    });
    fireEvent.change(screen.getByLabelText('End Time'), {
      target: { value: '11:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: /book court/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      court_id: 1,
      reservation_date: '2026-06-15',
      start_time: '10:00',
      end_time: '11:00',
    });
  });

  it('shows an error when submission fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Court already booked'));

    render(
      <ReservationForm
        courts={mockCourts}
        reservations={mockReservations}
        selectedDate="2026-06-15"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /book court/i }));

    expect(await screen.findByText('Court already booked')).toBeInTheDocument();
  });

  it('warns and disables inputs when the court is fully booked', () => {
    const fullDay: Reservation[] = [
      {
        id: 99,
        court_id: 1,
        member_id: 1,
        reservation_date: '2026-06-15',
        start_time: '07:00',
        end_time: '21:00',
        status: 'confirmed',
        court_name: 'Court 1',
        member_name: 'Alex Rivera',
      },
    ];

    render(
      <ReservationForm
        courts={mockCourts}
        reservations={fullDay}
        selectedDate="2026-06-15"
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });

    expect(
      screen.getByText('This court has no open time slots for the selected date.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book court/i })).toBeDisabled();
  });

  it('resets selection when the court is deselected', () => {
    render(
      <ReservationForm
        courts={mockCourts}
        reservations={mockReservations}
        selectedDate="2026-06-15"
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    expect(screen.getByLabelText('Start Time')).not.toBeDisabled();

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '' } });
    expect(screen.getByLabelText('Start Time')).toBeDisabled();
  });

  it('reconciles the selected time when reservations change', async () => {
    const { rerender } = render(
      <ReservationForm
        courts={mockCourts}
        reservations={[]}
        selectedDate="2026-06-15"
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    expect(screen.getByLabelText('Start Time')).toHaveValue('07:00');

    const blockMorning: Reservation[] = [
      {
        id: 50,
        court_id: 1,
        member_id: 1,
        reservation_date: '2026-06-15',
        start_time: '07:00',
        end_time: '09:00',
        status: 'confirmed',
        court_name: 'Court 1',
        member_name: 'Alex Rivera',
      },
    ];

    rerender(
      <ReservationForm
        courts={mockCourts}
        reservations={blockMorning}
        selectedDate="2026-06-15"
        onSubmit={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Start Time')).not.toHaveValue('07:00');
    });
  });
});
