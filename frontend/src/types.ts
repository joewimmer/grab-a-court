export type MemberRole = 'member' | 'admin';
export type CourtStatus = 'available' | 'maintenance' | 'unavailable';

export interface Member {
  id: number;
  name: string;
  email: string;
  role: MemberRole;
}

export interface CourtStatusView {
  id: number;
  name: string;
  surface_type: string;
  has_lighting: boolean;
  status: CourtStatus;
  current_reservation: {
    id: number;
    member_name: string;
    start_time: string;
    end_time: string;
  } | null;
  upcoming_reservations: Array<{
    id: number;
    member_name: string;
    start_time: string;
    end_time: string;
  }>;
}

export interface Reservation {
  id: number;
  court_id: number;
  member_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  court_name: string;
  member_name: string;
}

export interface CreateReservationInput {
  court_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
}
