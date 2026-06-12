import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { setupTestDatabase, teardownTestDatabase } from './test/helpers.js';

describe('API', () => {
  beforeEach(() => {
    setupTestDatabase();
  });

  afterEach(() => {
    teardownTestDatabase();
  });

  it('returns health status', async () => {
    const app = createApp();
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns demo members', async () => {
    const app = createApp();
    const response = await request(app).get('/api/members/demo');

    expect(response.status).toBe(200);
    expect(response.body.members).toHaveLength(2);
  });

  it('creates and lists reservations', async () => {
    const app = createApp();

    const createResponse = await request(app)
      .post('/api/reservations')
      .set('X-Demo-User-Id', '1')
      .send({
        court_id: 1,
        reservation_date: '2026-06-20',
        start_time: '11:00',
        end_time: '12:00',
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.reservation.court_name).toBe('Court 1');

    const listResponse = await request(app).get(
      '/api/reservations?date=2026-06-20',
    );

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.reservations).toHaveLength(1);
  });

  it('returns court status board', async () => {
    const app = createApp();
    const response = await request(app).get('/api/courts/status?date=2026-06-20');

    expect(response.status).toBe(200);
    expect(response.body.courts).toHaveLength(2);
  });

  it('allows admin to update court status', async () => {
    const app = createApp();
    const response = await request(app)
      .patch('/api/courts/1/status')
      .set('X-Demo-User-Id', '2')
      .send({ status: 'maintenance' });

    expect(response.status).toBe(200);
    expect(response.body.court.status).toBe('maintenance');
  });

  it('rejects non-admin court status updates', async () => {
    const app = createApp();
    const response = await request(app)
      .patch('/api/courts/1/status')
      .set('X-Demo-User-Id', '1')
      .send({ status: 'maintenance' });

    expect(response.status).toBe(403);
  });

  it('requires a status when updating a court', async () => {
    const app = createApp();
    const response = await request(app)
      .patch('/api/courts/1/status')
      .set('X-Demo-User-Id', '2')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/status is required/i);
  });

  it('returns a booking error when creating an invalid reservation', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/reservations')
      .set('X-Demo-User-Id', '1')
      .send({
        court_id: 2,
        reservation_date: '2026-06-20',
        start_time: '11:00',
        end_time: '12:00',
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/maintenance/);
  });

  it('cancels a reservation via the API', async () => {
    const app = createApp();
    const createResponse = await request(app)
      .post('/api/reservations')
      .set('X-Demo-User-Id', '1')
      .send({
        court_id: 1,
        reservation_date: '2026-06-21',
        start_time: '11:00',
        end_time: '12:00',
      });

    const reservationId = createResponse.body.reservation.id;
    const deleteResponse = await request(app)
      .delete(`/api/reservations/${reservationId}`)
      .set('X-Demo-User-Id', '1');

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.reservation.status).toBe('cancelled');
  });

  it('returns 404 when cancelling an unknown reservation', async () => {
    const app = createApp();
    const response = await request(app)
      .delete('/api/reservations/999')
      .set('X-Demo-User-Id', '1');

    expect(response.status).toBe(404);
  });

  it('requires the demo user header on mutating requests', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/reservations')
      .send({
        court_id: 1,
        reservation_date: '2026-06-20',
        start_time: '11:00',
        end_time: '12:00',
      });

    expect(response.status).toBe(401);
  });

  it('rejects a non-numeric demo user header', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/reservations')
      .set('X-Demo-User-Id', 'abc')
      .send({
        court_id: 1,
        reservation_date: '2026-06-20',
        start_time: '11:00',
        end_time: '12:00',
      });

    expect(response.status).toBe(400);
  });

  it('rejects an unknown demo user', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/reservations')
      .set('X-Demo-User-Id', '999')
      .send({
        court_id: 1,
        reservation_date: '2026-06-20',
        start_time: '11:00',
        end_time: '12:00',
      });

    expect(response.status).toBe(404);
  });
});
