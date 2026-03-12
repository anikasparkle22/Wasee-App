'use strict';

/**
 * Centralised error-response helper.
 * In production, 500-level errors return a generic message to avoid
 * leaking implementation details to clients.
 */
function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message =
    isProduction && status >= 500 ? 'Internal server error' : err.message || 'Internal server error';
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
