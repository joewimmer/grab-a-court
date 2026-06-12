import type {
  CourtStatusView,
  CreateReservationInput,
  Member,
  Reservation,
} from '../types';

const DEMO_USER_KEY = 'grab-a-court-demo-user';

export function getStoredDemoUser(): Member | null {
  const raw = localStorage.getItem(DEMO_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Member;
  } catch {
    return null;
  }
}

export function setStoredDemoUser(member: Member): void {
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(member));
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const demoUser = getStoredDemoUser();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (demoUser) {
    headers['X-Demo-User-Id'] = String(demoUser.id);
  }

  const response = await fetch(path, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchDemoMembers(): Promise<Member[]> {
  const data = await apiFetch<{ members: Member[] }>('/api/members/demo');
  return data.members;
}

export async function fetchCourtStatus(date: string): Promise<CourtStatusView[]> {
  const data = await apiFetch<{ courts: CourtStatusView[] }>(
    `/api/courts/status?date=${date}`,
  );
  return data.courts;
}

export async function fetchReservations(date: string): Promise<Reservation[]> {
  const data = await apiFetch<{ reservations: Reservation[] }>(
    `/api/reservations?date=${date}`,
  );
  return data.reservations;
}

export async function createReservation(
  input: CreateReservationInput,
): Promise<Reservation> {
  const data = await apiFetch<{ reservation: Reservation }>('/api/reservations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.reservation;
}

export async function cancelReservation(id: number): Promise<Reservation> {
  const data = await apiFetch<{ reservation: Reservation }>(
    `/api/reservations/${id}`,
    { method: 'DELETE' },
  );
  return data.reservation;
}

export async function updateCourtStatus(
  courtId: number,
  status: string,
): Promise<CourtStatusView> {
  const data = await apiFetch<{ court: CourtStatusView }>(
    `/api/courts/${courtId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );
  return data.court;
}
