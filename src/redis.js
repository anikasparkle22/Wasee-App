'use strict';

require('dotenv').config();
const Redis = require('ioredis');

const client = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

client.on('error', (err) => {
  console.error('[Redis] connection error:', err.message);
});

// ─── Key helpers ──────────────────────────────────────────────────────────────

/** GEO set that holds all available drivers */
const GEO_KEY = 'geo:drivers:available';

/** Hash storing metadata for a single driver */
const driverKey = (id) => `driver:${id}:info`;

/** Hash storing metadata for a single ride */
const rideKey = (id) => `ride:${id}`;

/** List of pending ride IDs waiting for a driver */
const PENDING_RIDES_KEY = 'rides:pending';

// ─── Driver helpers ───────────────────────────────────────────────────────────

/**
 * Register or update a driver's position in the GEO set and store their info.
 * @param {string} driverId
 * @param {number} longitude
 * @param {number} latitude
 * @param {object} meta  – extra fields (name, vehicle, …)
 */
async function setDriverLocation(driverId, longitude, latitude, meta = {}) {
  const member = `driver:${driverId}`;
  await client.geoadd(GEO_KEY, longitude, latitude, member);
  await client.hset(driverKey(driverId), {
    id: driverId,
    longitude: String(longitude),
    latitude: String(latitude),
    available: '1',
    updatedAt: new Date().toISOString(),
    ...Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, String(v)])),
  });
}

/**
 * Remove a driver from the available GEO set and mark them unavailable.
 * @param {string} driverId
 */
async function removeDriverLocation(driverId) {
  await client.zrem(GEO_KEY, `driver:${driverId}`);
  await client.hset(driverKey(driverId), 'available', '0', 'updatedAt', new Date().toISOString());
}

/**
 * Return drivers within `radiusKm` km of the given coordinates.
 * @param {number} longitude
 * @param {number} latitude
 * @param {number} radiusKm
 * @returns {Array<{member:string, distance:number}>}
 */
async function findNearbyDrivers(longitude, latitude, radiusKm) {
  // GEOSEARCH replaces the deprecated GEORADIUS command (Redis ≥ 6.2)
  const results = await client.geosearch(
    GEO_KEY,
    'FROMLONLAT',
    longitude,
    latitude,
    'BYRADIUS',
    radiusKm,
    'km',
    'ASC',
    'WITHCOORD',
    'WITHDIST',
    'COUNT',
    10,
  );
  return results.map(([member, distance, [lng, lat]]) => ({
    driverId: member.replace('driver:', ''),
    distance: parseFloat(distance),
    longitude: parseFloat(lng),
    latitude: parseFloat(lat),
  }));
}

/**
 * Fetch the info hash for a driver.
 * @param {string} driverId
 * @returns {object|null}
 */
async function getDriverInfo(driverId) {
  const data = await client.hgetall(driverKey(driverId));
  return data && Object.keys(data).length ? data : null;
}

// ─── Ride helpers ─────────────────────────────────────────────────────────────

/**
 * Persist a new ride request.
 * Only truly-pending rides (status === 'pending') are enqueued in PENDING_RIDES_KEY.
 * Auto-matched rides (status === 'matched') skip the queue.
 * @param {string} rideId
 * @param {object} fields  – must include a `status` field
 */
async function createRide(rideId, fields) {
  const rideFields = {
    id: rideId,
    status: 'pending', // default; overridden by fields.status if provided
    createdAt: new Date().toISOString(),
    ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, String(v)])),
  };
  await client.hset(rideKey(rideId), rideFields);
  if (rideFields.status === 'pending') {
    await client.lpush(PENDING_RIDES_KEY, rideId);
  }
}

/**
 * Remove a ride ID from the pending queue (used when a ride is accepted or cancelled).
 * @param {string} rideId
 */
async function removePendingRide(rideId) {
  await client.lrem(PENDING_RIDES_KEY, 0, rideId);
}

/**
 * Fetch a ride by ID.
 * @param {string} rideId
 * @returns {object|null}
 */
async function getRide(rideId) {
  const data = await client.hgetall(rideKey(rideId));
  return data && Object.keys(data).length ? data : null;
}

/**
 * Update arbitrary fields on a ride.
 * @param {string} rideId
 * @param {object} fields
 */
async function updateRide(rideId, fields) {
  await client.hset(rideKey(rideId), {
    updatedAt: new Date().toISOString(),
    ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, String(v)])),
  });
}

/**
 * Record a new rating for a driver and atomically recompute their average.
 * Uses HINCRBY (integer count) and HINCRBYFLOAT (float sum) for atomic updates.
 * @param {string} driverId
 * @param {number} newRating – integer 1–5
 * @returns {{ avgRating: number, count: number }}
 */
async function updateDriverRating(driverId, newRating) {
  const key = driverKey(driverId);
  const count = await client.hincrby(key, 'ratingCount', 1);
  const sum = parseFloat(await client.hincrbyfloat(key, 'ratingSum', newRating));
  const avg = sum / count;
  await client.hset(key, 'avgRating', avg.toFixed(2), 'updatedAt', new Date().toISOString());
  return { avgRating: parseFloat(avg.toFixed(2)), count };
}

/**
 * Append a completed trip record to a driver's trip list (capped at 100 entries).
 * @param {string} driverId
 * @param {object} tripData  – { rideId, from, to, fare, dist, completedAt, ... }
 */
async function addDriverTrip(driverId, tripData) {
  const listKey = `driver:${driverId}:trips`;
  await client.lpush(listKey, JSON.stringify({ ...tripData, savedAt: new Date().toISOString() }));
  await client.ltrim(listKey, 0, 99); // keep last 100 trips
}

/**
 * Retrieve recent completed trips for a driver (newest first).
 * @param {string} driverId
 * @param {number} limit
 * @returns {object[]}
 */
async function getDriverTrips(driverId, limit = 20) {
  const listKey = `driver:${driverId}:trips`;
  const raw = await client.lrange(listKey, 0, limit - 1);
  return raw.map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
}

/**
 * Append a completed trip record to a rider's trip history (capped at 200 entries).
 * @param {string} riderId
 * @param {object} tripData
 */
async function addRiderTrip(riderId, tripData) {
  const listKey = `rider:${riderId}:trips`;
  await client.lpush(listKey, JSON.stringify({ ...tripData, savedAt: new Date().toISOString() }));
  await client.ltrim(listKey, 0, 199);
}

/**
 * Retrieve recent completed trips for a rider (newest first).
 * @param {string} riderId
 * @param {number} limit
 * @returns {object[]}
 */
async function getRiderTrips(riderId, limit = 20) {
  const listKey = `rider:${riderId}:trips`;
  const raw = await client.lrange(listKey, 0, limit - 1);
  return raw.map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
}

module.exports = {
  client,
  GEO_KEY,
  PENDING_RIDES_KEY,
  driverKey,
  rideKey,
  setDriverLocation,
  removeDriverLocation,
  findNearbyDrivers,
  getDriverInfo,
  createRide,
  getRide,
  updateRide,
  removePendingRide,
  updateDriverRating,
  addDriverTrip,
  getDriverTrips,
  addRiderTrip,
  getRiderTrips,
};
