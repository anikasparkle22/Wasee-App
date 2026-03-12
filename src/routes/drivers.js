'use strict';

const { Router } = require('express');
const {
  setDriverLocation,
  removeDriverLocation,
  findNearbyDrivers,
  getDriverInfo,
} = require('../redis');

const router = Router();

// ─── POST /drivers/:id/location ───────────────────────────────────────────────
// Body: { longitude, latitude, name?, vehicle? }
router.post('/:id/location', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { longitude, latitude, ...meta } = req.body;

    if (longitude == null || latitude == null) {
      return res.status(400).json({ error: 'longitude and latitude are required' });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    if (Number.isNaN(lng) || Number.isNaN(lat)) {
      return res.status(400).json({ error: 'longitude and latitude must be numbers' });
    }

    await setDriverLocation(id, lng, lat, meta);
    const info = await getDriverInfo(id);
    return res.status(200).json({ message: 'Driver location updated', driver: info });
  } catch (err) {
    return next(err);
  }
});

// ─── DELETE /drivers/:id/location ─────────────────────────────────────────────
// Remove driver from the available pool
router.delete('/:id/location', async (req, res, next) => {
  try {
    const { id } = req.params;
    await removeDriverLocation(id);
    return res.status(200).json({ message: 'Driver marked unavailable' });
  } catch (err) {
    return next(err);
  }
});

// ─── POST /drivers/nearby ─────────────────────────────────────────────────────
// Body: { longitude, latitude, radiusKm? }
// Using POST (not GET) so that location data is not exposed in server access logs.
router.post('/nearby', async (req, res, next) => {
  try {
    const { longitude, latitude, radiusKm } = req.body;

    if (longitude == null || latitude == null) {
      return res.status(400).json({ error: 'longitude and latitude are required' });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const radius = radiusKm ? parseFloat(radiusKm) : parseFloat(process.env.MATCH_RADIUS_KM || '5');

    if (Number.isNaN(lng) || Number.isNaN(lat) || Number.isNaN(radius)) {
      return res.status(400).json({ error: 'longitude, latitude, and radiusKm must be numbers' });
    }

    const drivers = await findNearbyDrivers(lng, lat, radius);
    return res.status(200).json({ drivers, count: drivers.length });
  } catch (err) {
    return next(err);
  }
});

// ─── GET /drivers/:id ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const info = await getDriverInfo(req.params.id);
    if (!info) return res.status(404).json({ error: 'Driver not found' });
    return res.status(200).json(info);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
