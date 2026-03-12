'use strict';

const ID_MAX_LEN = 128;
const FIELD_MAX_LEN = 200;

/**
 * Validate and parse a coordinate pair.
 * Returns { error } on failure or { lng, lat } on success.
 *
 * @param {*} rawLng  – value from request body / params (may be string)
 * @param {*} rawLat
 * @returns {{ error: string }|{ lng: number, lat: number }}
 */
function validateCoordinates(rawLng, rawLat) {
  if (rawLng == null || rawLat == null) {
    return { error: 'longitude and latitude are required' };
  }
  const lng = parseFloat(rawLng);
  const lat = parseFloat(rawLat);
  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return { error: 'longitude and latitude must be numbers' };
  }
  if (lng < -180 || lng > 180) {
    return { error: 'longitude must be between -180 and 180' };
  }
  if (lat < -90 || lat > 90) {
    return { error: 'latitude must be between -90 and 90' };
  }
  return { lng, lat };
}

/**
 * Validate a driver/rider ID (non-empty string, max 128 chars).
 *
 * @param {*} id
 * @returns {{ error: string }|{ id: string }}
 */
function validateId(id) {
  if (!id || typeof id !== 'string' || !id.trim()) {
    return { error: 'id must be a non-empty string' };
  }
  const trimmed = id.trim();
  if (trimmed.length > ID_MAX_LEN) {
    return { error: `id must be at most ${ID_MAX_LEN} characters` };
  }
  return { id: trimmed };
}

/**
 * Truncate all string values in an object to FIELD_MAX_LEN characters.
 *
 * @param {object} obj
 * @returns {object}
 */
function sanitizeFields(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === 'string' ? v.slice(0, FIELD_MAX_LEN) : v,
    ]),
  );
}

module.exports = { validateCoordinates, validateId, sanitizeFields, ID_MAX_LEN, FIELD_MAX_LEN };
