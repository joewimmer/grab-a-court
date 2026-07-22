import { useState } from 'react';
import { Badge, Button, Modal, Table } from 'react-bootstrap';
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
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  function handleCloseModal() {
    if (!cancelling) {
      setSelectedReservation(null);
    }
  }

  async function handleConfirmCancel() {
    if (!selectedReservation) {
      return;
    }

    setCancelling(true);
    try {
      await onCancel(selectedReservation.id);
      setSelectedReservation(null);
    } finally {
      setCancelling(false);
    }
  }

  if (reservations.length === 0) {
    return <p className="text-muted mb-0">No reservations for this date.</p>;
  }

  return (
    <>
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
                        onClick={() => setSelectedReservation(reservation)}
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

      <Modal
        show={selectedReservation !== null}
        onHide={handleCloseModal}
        backdrop={cancelling ? 'static' : true}
        keyboard={!cancelling}
      >
        <Modal.Header closeButton={!cancelling}>
          <Modal.Title>Cancel reservation?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReservation && (
            <>
              <p className="mb-2">
                This will cancel the following reservation:
              </p>
              <ul className="mb-0">
                <li>
                  <strong>Court:</strong> {selectedReservation.court_name}
                </li>
                <li>
                  <strong>Member:</strong> {selectedReservation.member_name}
                </li>
                <li>
                  <strong>Date:</strong> {selectedReservation.reservation_date}
                </li>
                <li>
                  <strong>Time:</strong> {selectedReservation.start_time} –{' '}
                  {selectedReservation.end_time}
                </li>
              </ul>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            disabled={cancelling}
          >
            Keep reservation
          </Button>
          <Button
            variant="danger"
            onClick={() => void handleConfirmCancel()}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling…' : 'Cancel reservation'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
