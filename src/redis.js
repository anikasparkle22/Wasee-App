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
 * Only adds the ride to the pending queue when its effective status is 'pending';
 * auto-matched rides (status = 'matched') must NOT appear in that queue.
 * @param {string} rideId
 * @param {object} fields
 */
async function createRide(rideId, fields) {
  const rideFields = {
    id: rideId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    // Caller-supplied fields are spread last so they can override defaults (e.g.
    // status: 'matched' for auto-matched rides, which must NOT enter the pending queue).
    ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, String(v)])),
  };
  await client.hset(rideKey(rideId), rideFields);
  if (rideFields.status === 'pending') {
    await client.lpush(PENDING_RIDES_KEY, rideId);
  }
}

/**
 * Remove a ride ID from the pending queue (called when a driver accepts the ride).
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
};
