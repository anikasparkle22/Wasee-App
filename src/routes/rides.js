'use strict';

const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  createRide,
  getRide,
  updateRide,
  findNearbyDrivers,
  removeDriverLocation,
  setDriverLocation,
  getDriverInfo,
} = require('../redis');

const router = Router();

// ─── POST /rides ──────────────────────────────────────────────────────────────
// Body: { riderId, pickupLng, pickupLat, dropoffLng, dropoffLat }
// Automatically matches the nearest available driver within MATCH_RADIUS_KM.
router.post('/', async (req, res, next) => {
  try {
    const { riderId, pickupLng, pickupLat, dropoffLng, dropoffLat } = req.body;

    if (!riderId || pickupLng == null || pickupLat == null || dropoffLng == null || dropoffLat == null) {
      return res.status(400).json({
        error: 'riderId, pickupLng, pickupLat, dropoffLng and dropoffLat are required',
      });
    }

    const pLng = parseFloat(pickupLng);
    const pLat = parseFloat(pickupLat);
    const dLng = parseFloat(dropoffLng);
    const dLat = parseFloat(dropoffLat);

    if ([pLng, pLat, dLng, dLat].some(Number.isNaN)) {
      return res.status(400).json({ error: 'Coordinates must be numbers' });
    }

    const radiusKm = parseFloat(process.env.MATCH_RADIUS_KM || '5');
    const nearby = await findNearbyDrivers(pLng, pLat, radiusKm);

    const rideId = uuidv4();
    const fields = {
      riderId,
      pickupLng: pLng,
      pickupLat: pLat,
      dropoffLng: dLng,
      dropoffLat: dLat,
    };

    if (nearby.length > 0) {
      // Assign the closest available driver
      const matched = nearby[0];
      fields.driverId = matched.driverId;
      fields.status = 'matched';
      fields.driverDistance = matched.distance;
      await createRide(rideId, fields);
      // Remove driver from available pool while they serve this ride
      await removeDriverLocation(matched.driverId);
      const ride = await getRide(rideId);
      return res.status(201).json({ ride });
    }

    fields.status = 'pending';
    await createRide(rideId, fields);
    const ride = await getRide(rideId);
    return res.status(201).json({ ride });
  } catch (err) {
    return next(err);
  }
});

// ─── GET /rides/:id ───────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const ride = await getRide(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    return res.status(200).json(ride);
  } catch (err) {
    return next(err);
  }
});

// ─── PUT /rides/:id/accept ────────────────────────────────────────────────────
// Body: { driverId }
// A driver manually accepts a pending ride (useful when no driver was auto-matched).
router.put('/:id/accept', async (req, res, next) => {
  try {
    const ride = await getRide(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    if (ride.status !== 'pending') {
      return res.status(409).json({ error: `Ride is already ${ride.status}` });
    }

    const { driverId } = req.body;
    if (!driverId) return res.status(400).json({ error: 'driverId is required' });

    await updateRide(req.params.id, { driverId, status: 'matched' });
    await removeDriverLocation(driverId);
    const updated = await getRide(req.params.id);
    return res.status(200).json({ ride: updated });
  } catch (err) {
    return next(err);
  }
});

// ─── PUT /rides/:id/status ────────────────────────────────────────────────────
// Body: { status }   values: pickup | in_progress | completed | cancelled
router.put('/:id/status', async (req, res, next) => {
  try {
    const ride = await getRide(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    const ALLOWED = ['pickup', 'in_progress', 'completed', 'cancelled'];
    const { status } = req.body;

    if (!status || !ALLOWED.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ALLOWED.join(', ')}` });
    }

    await updateRide(req.params.id, { status });

    // When a ride ends, put the driver back into the available pool
    if ((status === 'completed' || status === 'cancelled') && ride.driverId) {
      const driverInfo = await getDriverInfo(ride.driverId);
      if (driverInfo && driverInfo.longitude && driverInfo.latitude) {
        await setDriverLocation(
          ride.driverId,
          parseFloat(driverInfo.longitude),
          parseFloat(driverInfo.latitude),
          { name: driverInfo.name, vehicle: driverInfo.vehicle },
        );
      }
    }

    const updated = await getRide(req.params.id);
    return res.status(200).json({ ride: updated });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
