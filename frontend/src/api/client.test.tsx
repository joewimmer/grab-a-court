import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cancelReservation,
  createReservation,
  fetchCourtStatus,
  fetchDemoMembers,
  fetchReservations,
  getStoredDemoUser,
  setStoredDemoUser,
  updateCourtStatus,
} from './client';
import type { Member } from '../types';

const member: Member = {
  id: 7,
  name: 'Alex Rivera',
  email: 'alex@demo.test',
  role: 'member',
};

function mockFetch(body: unknown, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('demo user storage', () => {
    it('returns null when no demo user is stored', () => {
      expect(getStoredDemoUser()).toBeNull();
    });

    it('round-trips the stored demo user', () => {
      setStoredDemoUser(member);
      expect(getStoredDemoUser()).toEqual(member);
    });

    it('returns null when stored value is not valid JSON', () => {
      localStorage.setItem('grab-a-court-demo-user', '{not json');
      expect(getStoredDemoUser()).toBeNull();
    });
  });

  it('fetches demo members', async () => {
    const fetchMock = mockFetch({ members: [member] });
    await expect(fetchDemoMembers()).resolves.toEqual([member]);
    expect(fetchMock).toHaveBeenCalledWith('/api/members/demo', expect.any(Object));
  });

  it('fetches court status for a date', async () => {
    const fetchMock = mockFetch({ courts: [] });
    await expect(fetchCourtStatus('2026-06-15')).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/courts/status?date=2026-06-15',
      expect.any(Object),
    );
  });

  it('fetches reservations for a date', async () => {
    mockFetch({ reservations: [] });
    await expect(fetchReservations('2026-06-15')).resolves.toEqual([]);
  });

  it('sends the demo user header on mutating requests', async () => {
    setStoredDemoUser(member);
    const fetchMock = mockFetch({ reservation: { id: 1 } });

    await createReservation({
      court_id: 1,
      reservation_date: '2026-06-15',
      start_time: '09:00',
      end_time: '10:00',
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers['X-Demo-User-Id']).toBe('7');
  });

  it('omits the demo user header when none is stored', async () => {
    const fetchMock = mockFetch({ reservations: [] });
    await fetchReservations('2026-06-15');
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers['X-Demo-User-Id']).toBeUndefined();
  });

  it('cancels a reservation', async () => {
    const fetchMock = mockFetch({ reservation: { id: 5, status: 'cancelled' } });
    const result = await cancelReservation(5);
    expect(result).toEqual({ id: 5, status: 'cancelled' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/reservations/5');
    expect(options.method).toBe('DELETE');
  });

  it('updates court status', async () => {
    const fetchMock = mockFetch({ court: { id: 1, status: 'maintenance' } });
    const result = await updateCourtStatus(1, 'maintenance');
    expect(result).toEqual({ id: 1, status: 'maintenance' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/courts/1/status');
    expect(options.method).toBe('PATCH');
  });

  it('throws the server-provided error message on failure', async () => {
    mockFetch({ error: 'Court is currently maintenance.' }, false, 409);
    await expect(fetchCourtStatus('2026-06-15')).rejects.toThrow(
      'Court is currently maintenance.',
    );
  });

  it('throws a status-based error when the body has no error field', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('no body')),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchReservations('2026-06-15')).rejects.toThrow('Request failed');
  });
});
