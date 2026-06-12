import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CourtStatusGrid } from './CourtStatusGrid';
import type { CourtStatusView } from '../types';

const mockCourts: CourtStatusView[] = [
  {
    id: 1,
    name: 'Court 1 - Championship',
    surface_type: 'Hard',
    has_lighting: true,
    status: 'available',
    current_reservation: {
      id: 1,
      member_name: 'Alex Rivera',
      start_time: '09:00',
      end_time: '10:00',
    },
    upcoming_reservations: [],
  },
  {
    id: 2,
    name: 'Court 2 - Lakeside',
    surface_type: 'Clay',
    has_lighting: true,
    status: 'maintenance',
    current_reservation: null,
    upcoming_reservations: [],
  },
];

describe('CourtStatusGrid', () => {
  it('renders all courts', () => {
    render(<CourtStatusGrid courts={mockCourts} />);

    expect(screen.getByText('Court 1 - Championship')).toBeInTheDocument();
    expect(screen.getByText('Court 2 - Lakeside')).toBeInTheDocument();
  });

  it('shows current reservation for active courts', () => {
    render(<CourtStatusGrid courts={mockCourts} />);

    expect(screen.getByText(/Alex Rivera/)).toBeInTheDocument();
  });

  it('shows maintenance status', () => {
    render(<CourtStatusGrid courts={mockCourts} />);

    expect(screen.getByText('maintenance')).toBeInTheDocument();
  });
});
