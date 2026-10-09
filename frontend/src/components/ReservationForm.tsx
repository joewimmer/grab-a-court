import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import type { CourtStatusView, CreateReservationInput, Reservation } from '../types';
import {
  getAvailableEndTimes,
  getAvailableStartTimes,
} from '../utils/bookingSlots';

export interface RefreshedAvailability {
  courts: CourtStatusView[];
  reservations: Reservation[];
}

interface ReservationFormProps {
  courts: CourtStatusView[];
  reservations: Reservation[];
  selectedDate: string;
  onSubmit: (input: CreateReservationInput) => Promise<void>;
  onRefreshTimes: () => Promise<RefreshedAvailability>;
}

export function ReservationForm({
  courts,
  reservations,
  selectedDate,
  onSubmit,
  onRefreshTimes,
}: ReservationFormProps) {
  const [courtId, setCourtId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [error, setError] = useState<string | null>(null);
  const [timeNotice, setTimeNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const availableCourts = courts.filter((c) => c.status === 'available');
  const selectedCourtId = courtId ? Number(courtId) : null;

  const availableStartTimes = useMemo(() => {
    if (!selectedCourtId) return [];
    return getAvailableStartTimes(selectedCourtId, selectedDate, reservations);
  }, [selectedCourtId, selectedDate, reservations]);

  const availableEndTimes = useMemo(() => {
    if (!selectedCourtId || !startTime) return [];
    return getAvailableEndTimes(
      selectedCourtId,
      startTime,
      selectedDate,
      reservations,
    );
  }, [selectedCourtId, startTime, selectedDate, reservations]);

  useEffect(() => {
    if (!selectedCourtId || availableStartTimes.length === 0) {
      return;
    }

    // A refresh leaves a cleared start or end empty so the member picks the next slot.
    if (!startTime || !endTime) {
      return;
    }

    if (!availableStartTimes.includes(startTime)) {
      const nextStart = availableStartTimes[0];
      setStartTime(nextStart);
      const ends = getAvailableEndTimes(
        selectedCourtId,
        nextStart,
        selectedDate,
        reservations,
      );
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
    selectedDate,
    reservations,
  ]);

  function handleCourtChange(nextCourtId: string) {
    setCourtId(nextCourtId);
    setTimeNotice(null);
    if (!nextCourtId) {
      return;
    }

    const starts = getAvailableStartTimes(
      Number(nextCourtId),
      selectedDate,
      reservations,
    );
    const nextStart = starts[0] ?? '';
    setStartTime(nextStart);
    const ends = getAvailableEndTimes(
      Number(nextCourtId),
      nextStart,
      selectedDate,
      reservations,
    );
    setEndTime(ends[0] ?? '');
  }

  function handleStartChange(nextStart: string) {
    setStartTime(nextStart);
    setTimeNotice(null);
    if (!selectedCourtId) {
      return;
    }

    const ends = getAvailableEndTimes(
      selectedCourtId,
      nextStart,
      selectedDate,
      reservations,
    );
    setEndTime(ends[0] ?? '');
  }

  async function handleRefreshTimes() {
    setError(null);
    setTimeNotice(null);
    setRefreshing(true);

    const previousCourtId = courtId;
    const previousStart = startTime;
    const previousEnd = endTime;

    try {
      const latest = await onRefreshTimes();
      if (!previousCourtId) {
        return;
      }

      const courtStillAvailable = latest.courts.some(
        (court) =>
          court.status === 'available' && String(court.id) === previousCourtId,
      );
      if (!courtStillAvailable) {
        setCourtId('');
        setStartTime('');
        setEndTime('');
        setTimeNotice('That court is no longer available. Choose another court.');
        return;
      }

      const starts = getAvailableStartTimes(
        Number(previousCourtId),
        selectedDate,
        latest.reservations,
      );
      if (previousStart && !starts.includes(previousStart)) {
        setStartTime('');
        setEndTime('');
        if (starts.length > 0) {
          setTimeNotice(
            'That time is no longer available. Choose another open slot.',
          );
        }
        return;
      }

      const ends = getAvailableEndTimes(
        Number(previousCourtId),
        previousStart,
        selectedDate,
        latest.reservations,
      );
      if (previousEnd && !ends.includes(previousEnd)) {
        setEndTime('');
        setTimeNotice(
          'That end time is no longer available. Choose another open slot.',
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh times');
    } finally {
      setRefreshing(false);
    }
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
      {timeNotice && (
        <Alert variant="warning" className="mb-3">
          {timeNotice}
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
              disabled={refreshing}
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
              disabled={!selectedCourtId || noAvailableSlots || refreshing}
            >
              {!startTime && <option value="">Select a time</option>}
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
              onChange={(e) => {
                setEndTime(e.target.value);
                setTimeNotice(null);
              }}
              disabled={!selectedCourtId || noAvailableSlots || refreshing || !startTime}
            >
              {!endTime && <option value="">Select a time</option>}
              {availableEndTimes.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
        <Button
          type="submit"
          variant="primary"
          disabled={
            submitting ||
            refreshing ||
            !selectedCourtId ||
            noAvailableSlots ||
            !startTime ||
            !endTime
          }
        >
          {submitting ? 'Booking...' : 'Book Court'}
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          onClick={handleRefreshTimes}
          disabled={refreshing || submitting}
          aria-busy={refreshing}
        >
          {refreshing ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Refreshing times...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
              Refresh times
            </>
          )}
        </Button>
      </div>
    </Form>
  );
}
