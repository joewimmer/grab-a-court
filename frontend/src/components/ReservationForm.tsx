import { useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import type { CourtStatusView, CreateReservationInput } from '../types';

interface ReservationFormProps {
  courts: CourtStatusView[];
  selectedDate: string;
  onSubmit: (input: CreateReservationInput) => Promise<void>;
}

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00',
];

export function ReservationForm({
  courts,
  selectedDate,
  onSubmit,
}: ReservationFormProps) {
  const [courtId, setCourtId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const availableCourts = courts.filter((c) => c.status === 'available');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onSubmit({
        court_id: Number(courtId),
        reservation_date: selectedDate,
        start_time: startTime,
        end_time: endTime,
      });
      setCourtId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reservation');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      <Row className="g-3">
        <Col md={4}>
          <Form.Group controlId="court-select">
            <Form.Label>Court</Form.Label>
            <Form.Select
              value={courtId}
              onChange={(e) => setCourtId(e.target.value)}
              required
            >
              <option value="">Select court</option>
              {availableCourts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="start-time">
            <Form.Label>Start Time</Form.Label>
            <Form.Select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="end-time">
            <Form.Label>End Time</Form.Label>
            <Form.Select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Button type="submit" variant="primary" className="mt-3" disabled={submitting}>
        {submitting ? 'Booking...' : 'Book Court'}
      </Button>
    </Form>
  );
}
