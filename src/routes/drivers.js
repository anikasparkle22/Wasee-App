'use strict';

const { Router } = require('express');
const {
  setDriverLocation,
  removeDriverLocation,
  findNearbyDrivers,
  getDriverInfo,
} = require('../redis');
const { validateCoordinates, validateId, sanitizeFields } = require('../utils/validation');

const router = Router();

// ─── POST /drivers/:id/location ───────────────────────────────────────────────
// Body: { longitude, latitude, name?, vehicle? }
router.post('/:id/location', async (req, res, next) => {
  try {
    const idResult = validateId(req.params.id);
    if (idResult.error) return res.status(400).json({ error: idResult.error });

    const { longitude, latitude, ...meta } = req.body;
    const coordResult = validateCoordinates(longitude, latitude);
    if (coordResult.error) return res.status(400).json({ error: coordResult.error });
    const { lng, lat } = coordResult;

    await setDriverLocation(idResult.id, lng, lat, sanitizeFields(meta));
    const info = await getDriverInfo(idResult.id);
    return res.status(200).json({ message: 'Driver location updated', driver: info });
  } catch (err) {
    return next(err);
  }
});

// ─── DELETE /drivers/:id/location ─────────────────────────────────────────────
// Remove driver from the available pool
router.delete('/:id/location', async (req, res, next) => {
  try {
    const idResult = validateId(req.params.id);
    if (idResult.error) return res.status(400).json({ error: idResult.error });

    await removeDriverLocation(idResult.id);
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

    const coordResult = validateCoordinates(longitude, latitude);
    if (coordResult.error) return res.status(400).json({ error: coordResult.error });
    const { lng, lat } = coordResult;

    const radius = radiusKm != null
      ? parseFloat(radiusKm)
      : parseFloat(process.env.MATCH_RADIUS_KM || '5');

    if (Number.isNaN(radius) || radius <= 0) {
      return res.status(400).json({ error: 'radiusKm must be a positive number' });
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
    const idResult = validateId(req.params.id);
    if (idResult.error) return res.status(400).json({ error: idResult.error });

    const info = await getDriverInfo(idResult.id);
    if (!info) return res.status(404).json({ error: 'Driver not found' });
    return res.status(200).json(info);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
