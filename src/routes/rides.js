'use strict';

const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  createRide,
  getRide,
  updateRide,
  findNearbyDrivers,
  removeDriverLocation,
  removePendingRide,
  setDriverLocation,
  getDriverInfo,
} = require('../redis');
const { validateCoordinates, validateId, sanitizeFields } = require('../utils/validation');

const router = Router();

// ─── POST /rides ──────────────────────────────────────────────────────────────
// Body: { riderId, pickupLng, pickupLat, dropoffLng, dropoffLat }
// Automatically matches the nearest available driver within MATCH_RADIUS_KM.
router.post('/', async (req, res, next) => {
  try {
    const { riderId, pickupLng, pickupLat, dropoffLng, dropoffLat } = req.body;

    const riderIdResult = validateId(String(riderId ?? ''));
    if (riderIdResult.error) {
      return res.status(400).json({
        error: 'riderId, pickupLng, pickupLat, dropoffLng and dropoffLat are required',
      });
    }

    const pickupResult = validateCoordinates(pickupLng, pickupLat);
    if (pickupResult.error) {
      return res.status(400).json({ error: pickupResult.error });
    }
    const dropoffResult = validateCoordinates(dropoffLng, dropoffLat);
    if (dropoffResult.error) {
      return res.status(400).json({ error: dropoffResult.error });
    }

    const { lng: pLng, lat: pLat } = pickupResult;
    const { lng: dLng, lat: dLat } = dropoffResult;

    const radiusKm = parseFloat(process.env.MATCH_RADIUS_KM || '5');
    const nearby = await findNearbyDrivers(pLng, pLat, radiusKm);

    const rideId = uuidv4();
    const fields = {
      riderId: riderIdResult.id,
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

    const driverIdResult = validateId(String(driverId));
    if (driverIdResult.error) return res.status(400).json({ error: driverIdResult.error });

    await updateRide(req.params.id, { driverId: driverIdResult.id, status: 'matched' });
    await removeDriverLocation(driverIdResult.id);
    // Remove from pending queue now that it has been accepted
    await removePendingRide(req.params.id);
    const updated = await getRide(req.params.id);
    return res.status(200).json({ ride: updated });
  } catch (err) {
    return next(err);
  }
});

// ─── PUT /rides/:id/status ────────────────────────────────────────────────────
// Body: { status }   values: pickup | in_progress | completed | cancelled
//
// Valid transitions (state machine):
//   matched    → pickup | cancelled
//   pickup     → in_progress | cancelled
//   in_progress → completed | cancelled
//
// Terminal states (completed, cancelled) cannot be changed.
const VALID_TRANSITIONS = {
  matched: ['pickup', 'cancelled'],
  pickup: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
};

router.put('/:id/status', async (req, res, next) => {
  try {
    const ride = await getRide(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    const ALLOWED = ['pickup', 'in_progress', 'completed', 'cancelled'];
    const { status } = req.body;

    if (!status || !ALLOWED.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ALLOWED.join(', ')}` });
    }

    const allowed = VALID_TRANSITIONS[ride.status];
    if (!allowed) {
      return res.status(409).json({ error: `Ride is already ${ride.status} and cannot be updated` });
    }
    if (!allowed.includes(status)) {
      return res
        .status(409)
        .json({ error: `Cannot transition from '${ride.status}' to '${status}'. Allowed: ${allowed.join(', ')}` });
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
