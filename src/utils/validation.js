'use strict';

const MAX_ID_LENGTH = 128;
const MAX_FIELD_LENGTH = 200;

/**
 * Validate that a longitude/latitude pair is numeric and within valid WGS-84 ranges.
 * @param {number} lng  – must be in [-180, 180]
 * @param {number} lat  – must be in [-90, 90]
 * @returns {string|null}  Error message, or null if valid.
 */
function validateCoordinates(lng, lat) {
  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return 'longitude and latitude must be numbers';
  }
  if (lng < -180 || lng > 180) {
    return 'longitude must be between -180 and 180';
  }
  if (lat < -90 || lat > 90) {
    return 'latitude must be between -90 and 90';
  }
  return null;
}

/**
 * Validate that an ID is a non-empty string within the permitted length.
 * @param {*}      value      – the value to check
 * @param {string} fieldName  – used in the error message (e.g. 'driverId')
 * @returns {string|null}  Error message, or null if valid.
 */
function validateId(value, fieldName) {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return `${fieldName} must be a non-empty string`;
  }
  if (value.length > MAX_ID_LENGTH) {
    return `${fieldName} must not exceed ${MAX_ID_LENGTH} characters`;
  }
  return null;
}

module.exports = { MAX_ID_LENGTH, MAX_FIELD_LENGTH, validateCoordinates, validateId };
