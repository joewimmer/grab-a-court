import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import type { CourtStatusView, CreateReservationInput, Reservation } from '../types';
import {
  getAvailableEndTimes,
  getAvailableStartTimes,
} from '../utils/bookingSlots';

interface ReservationFormProps {
  courts: CourtStatusView[];
  reservations: Reservation[];
  selectedDate: string;
  onSubmit: (input: CreateReservationInput) => Promise<void>;
}

export function ReservationForm({
  courts,
  reservations,
  selectedDate,
  onSubmit,
}: ReservationFormProps) {
  const [courtId, setCourtId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const availableCourts = courts.filter((c) => c.status === 'available');
  const selectedCourtId = courtId ? Number(courtId) : null;

  const availableStartTimes = useMemo(() => {
    if (!selectedCourtId) return [];
    return getAvailableStartTimes(selectedCourtId, reservations);
  }, [selectedCourtId, reservations]);

  const availableEndTimes = useMemo(() => {
    if (!selectedCourtId) return [];
    return getAvailableEndTimes(selectedCourtId, startTime, reservations);
  }, [selectedCourtId, startTime, reservations]);

  useEffect(() => {
    if (!selectedCourtId || availableStartTimes.length === 0) {
      return;
    }

    if (!availableStartTimes.includes(startTime)) {
      const nextStart = availableStartTimes[0];
      setStartTime(nextStart);
      const ends = getAvailableEndTimes(selectedCourtId, nextStart, reservations);
      setEndTime(ends[0] ?? '');
      return;
    }

    if (!availableEndTimes.includes(endTime)) {
      setEndTime(availableEndTimes[0] ?? '');
    }
  }, [
    selectedCourtId,
    availableStartTimes,
    availableEndTimes,
    startTime,
    endTime,
    reservations,
  ]);

  function handleCourtChange(nextCourtId: string) {
    setCourtId(nextCourtId);
    if (!nextCourtId) {
      return;
    }

    const starts = getAvailableStartTimes(Number(nextCourtId), reservations);
    const nextStart = starts[0] ?? '';
    setStartTime(nextStart);
    const ends = getAvailableEndTimes(Number(nextCourtId), nextStart, reservations);
    setEndTime(ends[0] ?? '');
  }

  function handleStartChange(nextStart: string) {
    setStartTime(nextStart);
    if (!selectedCourtId) {
      return;
    }

    const ends = getAvailableEndTimes(selectedCourtId, nextStart, reservations);
    setEndTime(ends[0] ?? '');
  }

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

  const noAvailableSlots =
    selectedCourtId !== null && availableStartTimes.length === 0;

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      {noAvailableSlots && (
        <Alert variant="warning" className="mb-3">
          This court has no open time slots for the selected date.
        </Alert>
      )}
      <Row className="g-3">
        <Col md={4}>
          <Form.Group controlId="court-select">
            <Form.Label>Court</Form.Label>
            <Form.Select
              value={courtId}
              onChange={(e) => handleCourtChange(e.target.value)}
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
              onChange={(e) => handleStartChange(e.target.value)}
              disabled={!selectedCourtId || noAvailableSlots}
            >
              {availableStartTimes.map((slot) => (
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
              disabled={!selectedCourtId || noAvailableSlots}
            >
              {availableEndTimes.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Button
        type="submit"
        variant="primary"
        className="mt-3"
        disabled={submitting || !selectedCourtId || noAvailableSlots}
      >
        {submitting ? 'Booking...' : 'Book Court'}
      </Button>
    </Form>
  );
}
