import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Card,
  Col,
  Container,
  Form,
  Navbar,
  Row,
  Spinner,
} from 'react-bootstrap';
import {
  cancelReservation,
  createReservation,
  fetchCourtStatus,
  fetchDemoMembers,
  fetchReservations,
  getStoredDemoUser,
  setStoredDemoUser,
  updateCourtStatus,
} from './api/client';
import { AdminPanel } from './components/AdminPanel';
import { CourtStatusGrid } from './components/CourtStatusGrid';
import { DemoUserSelector } from './components/DemoUserSelector';
import { ReservationForm } from './components/ReservationForm';
import { ReservationList } from './components/ReservationList';
import { ThemeToggle } from './components/ThemeToggle';
import type { CourtStatus, CourtStatusView, Member, Reservation } from './types';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUser, setCurrentUser] = useState<Member | null>(getStoredDemoUser());
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [courts, setCourts] = useState<CourtStatusView[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courtData, reservationData] = await Promise.all([
        fetchCourtStatus(selectedDate),
        fetchReservations(selectedDate),
      ]);
      setCourts(courtData);
      setReservations(reservationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDemoMembers()
      .then((data) => {
        setMembers(data);
        if (!currentUser && data.length > 0) {
          setCurrentUser(data[0]);
          setStoredDemoUser(data[0]);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load members');
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleUserSelect(member: Member) {
    setCurrentUser(member);
    setStoredDemoUser(member);
  }

  async function handleCreateReservation(
    input: Parameters<typeof createReservation>[0],
  ) {
    await createReservation(input);
    await loadData();
  }

  async function handleCancelReservation(id: number) {
    await cancelReservation(id);
    await loadData();
  }

  async function handleUpdateCourtStatus(courtId: number, status: CourtStatus) {
    await updateCourtStatus(courtId, status);
    await loadData();
  }

  const isAdmin = currentUser?.role === 'admin';
  const myReservations = reservations.filter(
    (r) => currentUser && r.member_id === currentUser.id,
  );

  return (
    <>
      <Navbar expand="lg" className="app-navbar mb-4">
        <Container>
          <Navbar.Brand className="brand-title">
            <i className="bi bi-dribbble me-2" />
            Grab A Court
          </Navbar.Brand>
          <div className="ms-auto d-flex align-items-center gap-3">
            <Navbar.Text className="text-white-50">
              Oak Ridge Tennis Club
            </Navbar.Text>
            <ThemeToggle />
          </div>
        </Container>
      </Navbar>

      <Container className="pb-5">
        <Row className="g-4 mb-4">
          <Col lg={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title>Welcome</Card.Title>
                <Card.Text className="text-muted">
                  Reserve one of eight tennis courts and view live availability across
                  the club.
                </Card.Text>
                <DemoUserSelector
                  members={members}
                  selectedMember={currentUser}
                  onSelect={handleUserSelect}
                />
                {currentUser && (
                  <div className="mt-3">
                    <Badge bg={isAdmin ? 'dark' : 'primary'} className="me-2">
                      {currentUser.role}
                    </Badge>
                    <span className="text-muted small">{currentUser.email}</span>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={8}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0">Court Status Board</Card.Title>
                  <Form.Control
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ maxWidth: 180 }}
                  />
                </div>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status" />
                  </div>
                ) : error ? (
                  <Alert variant="danger">{error}</Alert>
                ) : (
                  <CourtStatusGrid courts={courts} />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {currentUser && (
          <Row className="g-4">
            <Col lg={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Book a Court</Card.Title>
                  <ReservationForm
                    courts={courts}
                    reservations={reservations}
                    selectedDate={selectedDate}
                    onSubmit={handleCreateReservation}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>
                    {isAdmin ? 'All Reservations' : 'My Reservations'}
                  </Card.Title>
                  <ReservationList
                    reservations={isAdmin ? reservations : myReservations}
                    currentUser={currentUser}
                    onCancel={handleCancelReservation}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {isAdmin && (
          <Row className="g-4 mt-1">
            <Col>
              <Card className="shadow-sm border-dark">
                <Card.Body>
                  <Card.Title>
                    <i className="bi bi-shield-lock me-2" />
                    Admin: Court Maintenance
                  </Card.Title>
                  <AdminPanel
                    courts={courts}
                    onUpdateStatus={handleUpdateCourtStatus}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}
