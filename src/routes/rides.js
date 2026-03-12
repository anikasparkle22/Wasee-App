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
  updateDriverRating,
  addDriverTrip,
  addRiderTrip,
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

    // ── Compute distance and fare (SYP pricing: $1 start + $1.50/km) ──────────
    const R = 6371;
    const dLatR = (dLat - pLat) * (Math.PI / 180);
    const dLngR = (dLng - pLng) * (Math.PI / 180);
    const a =
      Math.sin(dLatR / 2) ** 2 +
      Math.cos(pLat * (Math.PI / 180)) * Math.cos(dLat * (Math.PI / 180)) * Math.sin(dLngR / 2) ** 2;
    const distanceKm = parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
    const fareUSD = parseFloat(Math.max(1.0, 1.0 + 1.5 * distanceKm).toFixed(2));
    // Syrian Pound equivalent (1 USD ≈ 13 000 SYP)
    const SYP_RATE = 13000;
    const fareSYP = Math.round(fareUSD * SYP_RATE);

    const radiusKm = parseFloat(process.env.MATCH_RADIUS_KM || '5');
    const nearby = await findNearbyDrivers(pLng, pLat, radiusKm);

    const rideId = uuidv4();
    const fields = {
      riderId: riderIdResult.id,
      pickupLng: pLng,
      pickupLat: pLat,
      dropoffLng: dLng,
      dropoffLat: dLat,
      distanceKm,
      fareUSD,
      fareSYP,
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
    // and persist trip data for both driver and rider histories.
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

      if (status === 'completed') {
        const tripRecord = {
          rideId: req.params.id,
          riderId: ride.riderId,
          driverId: ride.driverId,
          pickupLng: ride.pickupLng,
          pickupLat: ride.pickupLat,
          dropoffLng: ride.dropoffLng,
          dropoffLat: ride.dropoffLat,
          fareUSD: ride.fareUSD,
          fareSYP: ride.fareSYP,
          distanceKm: ride.distanceKm,
          completedAt: new Date().toISOString(),
        };
        await addDriverTrip(ride.driverId, tripRecord);
        if (ride.riderId) {
          await addRiderTrip(ride.riderId, tripRecord);
        }
      }
    }

    const updated = await getRide(req.params.id);
    return res.status(200).json({ ride: updated });
  } catch (err) {
    return next(err);
  }
});

// ─── PUT /rides/:id/rating ────────────────────────────────────────────────────
// Body: { rating }   integer 1–5
// Records a rider's rating for their driver once the ride is completed.
// Also updates the driver's running average rating.
router.put('/:id/rating', async (req, res, next) => {
  try {
    const ride = await getRide(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    if (ride.status !== 'completed') {
      return res.status(409).json({ error: 'Can only rate completed rides' });
    }
    if (ride.riderRating) {
      return res.status(409).json({ error: 'Ride already rated' });
    }

    const parsed = parseInt(req.body.rating, 10);
    if (!req.body.rating || Number.isNaN(parsed) || parsed < 1 || parsed > 5) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }

    await updateRide(req.params.id, { riderRating: String(parsed) });

    let driverRating = null;
    if (ride.driverId) {
      driverRating = await updateDriverRating(ride.driverId, parsed);
    }

    const updated = await getRide(req.params.id);
    return res.status(200).json({ ride: updated, driverAvgRating: driverRating?.avgRating ?? null });
  } catch (err) {
    return next(err);
  }
});

// ─── GET /rides/:id/driver-trips ─────────────────────────────────────────────
// Returns the recent trip history for the driver assigned to this ride.
// Useful for the driver dashboard's "recent trips" panel.
router.get('/:id/driver-trips', async (req, res, next) => {
  try {
    const ride = await getRide(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (!ride.driverId) return res.status(404).json({ error: 'No driver assigned to this ride' });

    const { getDriverTrips } = require('../redis');
    const trips = await getDriverTrips(ride.driverId);
    return res.status(200).json({ trips, driverId: ride.driverId });
  } catch (err) {
    return next(err);
  }
});

// ─── GET /riders/:riderId/trips ───────────────────────────────────────────────
// Returns recent trip history for a rider (their activity feed).
// Note: this route is intentionally on the /rides router for simplicity.
router.get('/rider/:riderId/trips', async (req, res, next) => {
  try {
    const riderIdResult = validateId(String(req.params.riderId ?? ''));
    if (riderIdResult.error) return res.status(400).json({ error: riderIdResult.error });

    const { getRiderTrips } = require('../redis');
    const trips = await getRiderTrips(riderIdResult.id);
    return res.status(200).json({ trips, riderId: riderIdResult.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
