import { Badge, Card, Col, Row } from 'react-bootstrap';
import type { CourtStatus, CourtStatusView } from '../types';

interface CourtStatusGridProps {
  courts: CourtStatusView[];
}

function statusVariant(status: CourtStatus): string {
  switch (status) {
    case 'available':
      return 'success';
    case 'maintenance':
      return 'warning';
    case 'unavailable':
      return 'danger';
    default:
      return 'secondary';
  }
}

function displayStatus(court: CourtStatusView): string {
  if (court.status !== 'available') {
    return court.status;
  }
  if (court.current_reservation) {
    return 'in use';
  }
  return 'available';
}

export function CourtStatusGrid({ courts }: CourtStatusGridProps) {
  return (
    <Row xs={1} sm={2} lg={4} className="g-3">
      {courts.map((court) => (
        <Col key={court.id}>
          <Card className={`court-card court-card--${court.status} h-100`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <Card.Title className="h6 mb-0">{court.name}</Card.Title>
                <Badge bg={statusVariant(court.status)} className="text-capitalize">
                  {displayStatus(court)}
                </Badge>
              </div>
              <Card.Text className="small text-muted mb-2">
                {court.surface_type} surface
                {court.has_lighting ? ' · Lights' : ' · No lights'}
              </Card.Text>
              {court.current_reservation ? (
                <div className="court-activity">
                  <strong>Now:</strong> {court.current_reservation.member_name}
                  <br />
                  <span className="text-muted">
                    {court.current_reservation.start_time} –{' '}
                    {court.current_reservation.end_time}
                  </span>
                </div>
              ) : court.upcoming_reservations.length > 0 ? (
                <div className="court-activity">
                  <strong>Next:</strong> {court.upcoming_reservations[0].member_name}
                  <br />
                  <span className="text-muted">
                    {court.upcoming_reservations[0].start_time} –{' '}
                    {court.upcoming_reservations[0].end_time}
                  </span>
                </div>
              ) : (
                <div className="court-activity text-muted">No reservations today</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
