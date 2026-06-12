import { useState } from 'react';
import { Alert, Badge, Button, Col, Form, Row } from 'react-bootstrap';
import type { CourtStatus, CourtStatusView } from '../types';

interface AdminPanelProps {
  courts: CourtStatusView[];
  onUpdateStatus: (courtId: number, status: CourtStatus) => Promise<void>;
}

export function AdminPanel({ courts, onUpdateStatus }: AdminPanelProps) {
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CourtStatus>('available');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await onUpdateStatus(Number(selectedCourt), selectedStatus);
      setSuccess('Court status updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update court status');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="text-muted">
        Manage court availability. Courts in maintenance or unavailable cannot be booked.
      </p>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row className="g-3 align-items-end">
          <Col md={5}>
            <Form.Group controlId="admin-court">
              <Form.Label>Court</Form.Label>
              <Form.Select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                required
              >
                <option value="">Select court</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="admin-status">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CourtStatus)}
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="unavailable">Unavailable</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Button type="submit" variant="dark" disabled={submitting} className="w-100">
              {submitting ? 'Updating...' : 'Update Status'}
            </Button>
          </Col>
        </Row>
      </Form>

      <div className="mt-4">
        <h6 className="mb-3">Current Court Status</h6>
        <div className="d-flex flex-wrap gap-2">
          {courts.map((court) => (
            <Badge
              key={court.id}
              bg={
                court.status === 'available'
                  ? 'success'
                  : court.status === 'maintenance'
                    ? 'warning'
                    : 'danger'
              }
              className="text-capitalize py-2 px-3"
            >
              {court.name}: {court.status}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
