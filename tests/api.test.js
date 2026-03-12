'use strict';

/**
 * Integration tests for the Wasee API.
 *
 * These tests use a real (or mock) Redis connection.
 * Set REDIS_URL in the environment to override the default.
 *
 * All Redis keys created during tests are flushed via a test-specific prefix
 * or full FLUSHDB on the test DB so that production data is never affected.
 * Use REDIS_URL=redis://127.0.0.1:6379/1  (database index 1) for isolation.
 */

process.env.NODE_ENV = 'test';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379/1';
process.env.MATCH_RADIUS_KM = '50'; // generous radius for tests
process.env.CORS_ORIGIN = 'http://localhost:5173'; // test CORS origin

const request = require('supertest');
const app = require('../src/app');
const { client: redis } = require('../src/redis');

beforeAll(async () => {
  try {
    await redis.connect();
  } catch (err) {
    throw new Error(
      `[Test setup] Could not connect to Redis at ${process.env.REDIS_URL}.\n` +
        'Make sure Redis is running before executing tests (e.g. `redis-server`).\n' +
        `Original error: ${err.message}`,
    );
  }
  await redis.flushdb();
});

afterAll(async () => {
  await redis.flushdb();
  await redis.quit();
});

// ─── Health ───────────────────────────────────────────────────────────────────
describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ─── Drivers ─────────────────────────────────────────────────────────────────
describe('Driver endpoints', () => {
  const driverId = 'driver-test-001';

  it('POST /drivers/:id/location – registers driver location', async () => {
    const res = await request(app)
      .post(`/drivers/${driverId}/location`)
      .send({ longitude: 36.3, latitude: 33.5, name: 'Ahmad', vehicle: 'Toyota Corolla' });

    expect(res.status).toBe(200);
    expect(res.body.driver).toBeDefined();
    expect(res.body.driver.id).toBe(driverId);
    expect(res.body.driver.available).toBe('1');
  });

  it('POST /drivers/:id/location – 400 when coords missing', async () => {
    const res = await request(app)
      .post(`/drivers/${driverId}/location`)
      .send({ name: 'Ahmad' });
    expect(res.status).toBe(400);
  });

  it('GET /drivers/nearby – finds the registered driver', async () => {
    const res = await request(app)
      .post('/drivers/nearby')
      .send({ longitude: 36.3, latitude: 33.5, radiusKm: 10 });
    expect(res.status).toBe(200);
    expect(res.body.drivers.length).toBeGreaterThan(0);
    expect(res.body.drivers[0].driverId).toBe(driverId);
  });

  it('GET /drivers/:id – returns driver info', async () => {
    const res = await request(app).get(`/drivers/${driverId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(driverId);
  });

  it('GET /drivers/:id – 404 for unknown driver', async () => {
    const res = await request(app).get('/drivers/nobody');
    expect(res.status).toBe(404);
  });

  it('DELETE /drivers/:id/location – marks driver unavailable', async () => {
    const res = await request(app).delete(`/drivers/${driverId}/location`);
    expect(res.status).toBe(200);

    // Should no longer appear in nearby search
    const nearby = await request(app)
      .post('/drivers/nearby')
      .send({ longitude: 36.3, latitude: 33.5, radiusKm: 10 });
    expect(nearby.body.drivers.map((d) => d.driverId)).not.toContain(driverId);
  });
});

// ─── Rides ────────────────────────────────────────────────────────────────────
describe('Ride endpoints', () => {
  const driverId = 'driver-ride-test-001';
  let rideId;

  beforeAll(async () => {
    // Register a driver so the ride request can be auto-matched
    await request(app)
      .post(`/drivers/${driverId}/location`)
      .send({ longitude: 36.3, latitude: 33.5, name: 'Bilal', vehicle: 'Kia Sportage' });
  });

  it('POST /rides – creates a ride and auto-matches the driver', async () => {
    const res = await request(app).post('/rides').send({
      riderId: 'rider-001',
      pickupLng: 36.3,
      pickupLat: 33.5,
      dropoffLng: 36.35,
      dropoffLat: 33.52,
    });

    expect(res.status).toBe(201);
    expect(res.body.ride).toBeDefined();
    expect(res.body.ride.status).toBe('matched');
    expect(res.body.ride.driverId).toBe(driverId);
    rideId = res.body.ride.id;
  });

  it('POST /rides – 400 when required fields missing', async () => {
    const res = await request(app).post('/rides').send({ riderId: 'rider-002' });
    expect(res.status).toBe(400);
  });

  it('GET /rides/:id – returns the ride', async () => {
    const res = await request(app).get(`/rides/${rideId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(rideId);
  });

  it('GET /rides/:id – 404 for unknown ride', async () => {
    const res = await request(app).get('/rides/no-such-ride');
    expect(res.status).toBe(404);
  });

  it('PUT /rides/:id/status – transitions matched → pickup', async () => {
    const res = await request(app)
      .put(`/rides/${rideId}/status`)
      .send({ status: 'pickup' });
    expect(res.status).toBe(200);
    expect(res.body.ride.status).toBe('pickup');
  });

  it('PUT /rides/:id/status – 400 for invalid status value', async () => {
    const res = await request(app)
      .put(`/rides/${rideId}/status`)
      .send({ status: 'flying' });
    expect(res.status).toBe(400);
  });

  it('PUT /rides/:id/status – transitions pickup → in_progress', async () => {
    const res = await request(app)
      .put(`/rides/${rideId}/status`)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.ride.status).toBe('in_progress');
  });

  it('PUT /rides/:id/status – completes the ride and restores driver', async () => {
    const res = await request(app)
      .put(`/rides/${rideId}/status`)
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.ride.status).toBe('completed');

    // Driver should be back in the available pool
    const nearby = await request(app)
      .post('/drivers/nearby')
      .send({ longitude: 36.3, latitude: 33.5, radiusKm: 10 });
    expect(nearby.body.drivers.map((d) => d.driverId)).toContain(driverId);
  });

  it('POST /rides – creates a pending ride when no driver available', async () => {
    // Remove all drivers
    await redis.del('geo:drivers:available');

    const res = await request(app).post('/rides').send({
      riderId: 'rider-003',
      pickupLng: 36.3,
      pickupLat: 33.5,
      dropoffLng: 36.35,
      dropoffLat: 33.52,
    });

    expect(res.status).toBe(201);
    expect(res.body.ride.status).toBe('pending');
    expect(res.body.ride.driverId).toBeUndefined();
  });

  describe('Manual accept', () => {
    let pendingRideId;
    const acceptingDriver = 'driver-accept-001';

    beforeAll(async () => {
      // Ensure a pending ride exists
      await redis.del('geo:drivers:available');
      const res = await request(app).post('/rides').send({
        riderId: 'rider-004',
        pickupLng: 36.3,
        pickupLat: 33.5,
        dropoffLng: 36.35,
        dropoffLat: 33.52,
      });
      pendingRideId = res.body.ride.id;
    });

    it('PUT /rides/:id/accept – driver manually accepts pending ride', async () => {
      const res = await request(app)
        .put(`/rides/${pendingRideId}/accept`)
        .send({ driverId: acceptingDriver });
      expect(res.status).toBe(200);
      expect(res.body.ride.status).toBe('matched');
      expect(res.body.ride.driverId).toBe(acceptingDriver);
    });

    it('PUT /rides/:id/accept – 409 when ride already matched', async () => {
      const res = await request(app)
        .put(`/rides/${pendingRideId}/accept`)
        .send({ driverId: acceptingDriver });
      expect(res.status).toBe(409);
    });

    it('PUT /rides/:id/accept – 400 when driverId missing', async () => {
      // create a fresh pending ride first
      await redis.del('geo:drivers:available');
      const created = await request(app).post('/rides').send({
        riderId: 'rider-005',
        pickupLng: 36.3,
        pickupLat: 33.5,
        dropoffLng: 36.35,
        dropoffLat: 33.52,
      });
      const res = await request(app)
        .put(`/rides/${created.body.ride.id}/accept`)
        .send({});
      expect(res.status).toBe(400);
    });
  });
});

// ─── 404 catch-all ────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/no-such-route');
    expect(res.status).toBe(404);
  });
});

// ─── CORS ────────────────────────────────────────────────────────────────────
describe('CORS headers', () => {
  it('returns Access-Control-Allow-Origin for allowed origin', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('responds to preflight OPTIONS request', async () => {
    const res = await request(app)
      .options('/rides')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.status).toBe(204);
  });
});

// ─── Ride status state machine ────────────────────────────────────────────────
describe('Ride status state-machine transitions', () => {
  const driverId = 'driver-sm-001';
  let rideId;

  beforeAll(async () => {
    await request(app)
      .post(`/drivers/${driverId}/location`)
      .send({ longitude: 36.3, latitude: 33.5, name: 'SM Driver', vehicle: 'Sedan' });

    const res = await request(app).post('/rides').send({
      riderId: 'rider-sm-001',
      pickupLng: 36.3,
      pickupLat: 33.5,
      dropoffLng: 36.35,
      dropoffLat: 33.52,
    });
    rideId = res.body.ride.id;
    // Ride should be auto-matched
    expect(res.body.ride.status).toBe('matched');
  });

  it('409 when jumping from matched directly to in_progress', async () => {
    const res = await request(app)
      .put(`/rides/${rideId}/status`)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(409);
  });

  it('200 matched → pickup', async () => {
    const res = await request(app)
      .put(`/rides/${rideId}/status`)
      .send({ status: 'pickup' });
    expect(res.status).toBe(200);
    expect(res.body.ride.status).toBe('pickup');
  });

  it('409 when jumping from pickup directly to completed', async () => {
    const res = await request(app)
      .put(`/rides/${rideId}/status`)
      .send({ status: 'completed' });
    expect(res.status).toBe(409);
  });

  it('200 pickup → in_progress', async () => {
    const res = await request(app)
      .put(`/rides/${rideId}/status`)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.ride.status).toBe('in_progress');
  });

  it('200 in_progress → completed', async () => {
    const res = await request(app)
      .put(`/rides/${rideId}/status`)
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.ride.status).toBe('completed');
  });

  it('409 when updating a terminal (completed) ride', async () => {
    const res = await request(app)
      .put(`/rides/${rideId}/status`)
      .send({ status: 'cancelled' });
    expect(res.status).toBe(409);
  });
});
