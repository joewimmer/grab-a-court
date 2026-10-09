import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ReservationForm, type RefreshedAvailability } from './ReservationForm';
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

function resolvedRefresh(
  reservations: Reservation[] = mockReservations,
  courts: CourtStatusView[] = mockCourts,
) {
  return vi.fn().mockResolvedValue({ courts, reservations });
}

function RefreshHarness({
  initialReservations = [] as Reservation[],
  nextReservations,
  nextCourts = mockCourts,
}: {
  initialReservations?: Reservation[];
  nextReservations: Reservation[];
  nextCourts?: CourtStatusView[];
}) {
  const [reservations, setReservations] = useState(initialReservations);
  const [courts, setCourts] = useState(mockCourts);

  return (
    <ReservationForm
      courts={courts}
      reservations={reservations}
      selectedDate="2026-06-15"
      onSubmit={vi.fn()}
      onRefreshTimes={async () => {
        const latest: RefreshedAvailability = {
          courts: nextCourts,
          reservations: nextReservations,
        };
        setCourts(latest.courts);
        setReservations(latest.reservations);
        return latest;
      }}
    />
  );
}

describe('ReservationForm', () => {
  it('only lists available courts', () => {
    render(
      <ReservationForm
        courts={mockCourts}
        reservations={mockReservations}
        selectedDate="2026-06-15"
        onSubmit={vi.fn()}
        onRefreshTimes={resolvedRefresh()}
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
        onRefreshTimes={resolvedRefresh()}
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
        onRefreshTimes={resolvedRefresh()}
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

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        court_id: 1,
        reservation_date: '2026-06-15',
        start_time: '10:00',
        end_time: '11:00',
      });
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
        onRefreshTimes={resolvedRefresh()}
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
        onRefreshTimes={resolvedRefresh(fullDay)}
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
        onRefreshTimes={resolvedRefresh()}
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
        onRefreshTimes={resolvedRefresh([])}
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
        onRefreshTimes={resolvedRefresh(blockMorning)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Start Time')).not.toHaveValue('07:00');
    });
  });

  it('shows a loading state while refreshing times', async () => {
    let resolveRefresh: (value: RefreshedAvailability) => void = () => {};
    const onRefreshTimes = vi.fn(
      () =>
        new Promise<RefreshedAvailability>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    render(
      <ReservationForm
        courts={mockCourts}
        reservations={mockReservations}
        selectedDate="2026-06-15"
        onSubmit={vi.fn()}
        onRefreshTimes={onRefreshTimes}
      />,
    );

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /refresh times/i }));

    const refreshingButton = await screen.findByRole('button', { name: /refreshing times/i });
    expect(refreshingButton).toBeDisabled();
    expect(refreshingButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: /book court/i })).toBeDisabled();

    resolveRefresh({ courts: mockCourts, reservations: mockReservations });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh times/i })).toBeEnabled();
    });
  });

  it('keeps the court and time when a refresh leaves the slot open', async () => {
    const onRefreshTimes = resolvedRefresh();

    render(
      <ReservationForm
        courts={mockCourts}
        reservations={mockReservations}
        selectedDate="2026-06-15"
        onSubmit={vi.fn()}
        onRefreshTimes={onRefreshTimes}
      />,
    );

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('End Time'), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: /refresh times/i }));

    await waitFor(() => expect(onRefreshTimes).toHaveBeenCalledOnce());
    expect(screen.getByLabelText('Court')).toHaveValue('1');
    expect(screen.getByLabelText('Start Time')).toHaveValue('10:00');
    expect(screen.getByLabelText('End Time')).toHaveValue('11:00');
    expect(screen.queryByText(/no longer available/i)).not.toBeInTheDocument();
  });

  it('clears a selected time that another member already booked', async () => {
    const taken: Reservation[] = [
      {
        id: 2,
        court_id: 1,
        member_id: 2,
        reservation_date: '2026-06-15',
        start_time: '10:00',
        end_time: '11:00',
        status: 'confirmed',
        court_name: 'Court 1',
        member_name: 'Jordan Kim',
      },
    ];

    render(<RefreshHarness nextReservations={taken} />);

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('End Time'), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: /refresh times/i }));

    expect(
      await screen.findByText('That time is no longer available. Choose another open slot.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Court')).toHaveValue('1');
    expect(screen.getByLabelText('Start Time')).toHaveValue('');

    const startValues = Array.from(
      screen.getByLabelText('Start Time').querySelectorAll('option'),
    ).map((option) => option.textContent);
    expect(startValues).not.toContain('10:00');
    expect(startValues).toContain('09:00');
  });

  it('clears only the end time when the start is still open', async () => {
    const taken: Reservation[] = [
      {
        id: 3,
        court_id: 1,
        member_id: 2,
        reservation_date: '2026-06-15',
        start_time: '11:00',
        end_time: '12:00',
        status: 'confirmed',
        court_name: 'Court 1',
        member_name: 'Jordan Kim',
      },
    ];

    render(<RefreshHarness nextReservations={taken} />);

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('End Time'), { target: { value: '12:00' } });
    fireEvent.click(screen.getByRole('button', { name: /refresh times/i }));

    expect(
      await screen.findByText(
        'That end time is no longer available. Choose another open slot.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Court')).toHaveValue('1');
    expect(screen.getByLabelText('Start Time')).toHaveValue('10:00');
    expect(screen.getByLabelText('End Time')).toHaveValue('');

    const endValues = Array.from(
      screen.getByLabelText('End Time').querySelectorAll('option'),
    ).map((option) => option.textContent);
    expect(endValues).not.toContain('12:00');
    expect(endValues).toContain('11:00');
  });

  it('clears the court when a refresh shows it is no longer bookable', async () => {
    const closedCourts = mockCourts.map((court) =>
      court.id === 1 ? { ...court, status: 'maintenance' as const } : court,
    );

    render(<RefreshHarness nextReservations={[]} nextCourts={closedCourts} />);

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /refresh times/i }));

    expect(
      await screen.findByText('That court is no longer available. Choose another court.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Court')).toHaveValue('');
    expect(screen.getByLabelText('Start Time')).toBeDisabled();
  });

  it('keeps the current selection when refreshing times fails', async () => {
    const onRefreshTimes = vi.fn().mockRejectedValue(new Error('Failed to refresh times'));

    render(
      <ReservationForm
        courts={mockCourts}
        reservations={[]}
        selectedDate="2026-06-15"
        onSubmit={vi.fn()}
        onRefreshTimes={onRefreshTimes}
      />,
    );

    fireEvent.change(screen.getByLabelText('Court'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('End Time'), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: /refresh times/i }));

    expect(await screen.findByText('Failed to refresh times')).toBeInTheDocument();
    expect(screen.getByLabelText('Court')).toHaveValue('1');
    expect(screen.getByLabelText('Start Time')).toHaveValue('10:00');
    expect(screen.getByLabelText('End Time')).toHaveValue('11:00');
  });
});
