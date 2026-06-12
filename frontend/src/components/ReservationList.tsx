import { Badge, Button, Table } from 'react-bootstrap';
import type { Member, Reservation } from '../types';

interface ReservationListProps {
  reservations: Reservation[];
  currentUser: Member | null;
  onCancel: (id: number) => Promise<void>;
}

export function ReservationList({
  reservations,
  currentUser,
  onCancel,
}: ReservationListProps) {
  if (reservations.length === 0) {
    return <p className="text-muted mb-0">No reservations for this date.</p>;
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0">
        <thead>
          <tr>
            <th>Court</th>
            <th>Member</th>
            <th>Time</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => {
            const canCancel =
              currentUser &&
              (currentUser.role === 'admin' ||
                reservation.member_id === currentUser.id);

            return (
              <tr key={reservation.id}>
                <td>{reservation.court_name}</td>
                <td>{reservation.member_name}</td>
                <td>
                  {reservation.start_time} – {reservation.end_time}
                </td>
                <td>
                  <Badge bg="success" className="text-capitalize">
                    {reservation.status}
                  </Badge>
                </td>
                <td className="text-end">
                  {canCancel && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onCancel(reservation.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
