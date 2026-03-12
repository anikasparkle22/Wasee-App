'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const driversRouter = require('./routes/drivers');
const ridesRouter = require('./routes/rides');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow the React frontend (or any configured origin) to call this API.
// Set CORS_ORIGIN=* to allow all origins during development/testing only.
// For production, always set this to your exact frontend URL (e.g. https://wasee.app).
// Comma-separate multiple origins to support both web and mobile clients simultaneously
// (e.g. CORS_ORIGIN=https://wasee.app,https://driver.wasee.app).
const corsEnv = process.env.CORS_ORIGIN || 'http://localhost:5173';
let corsOrigin;
if (corsEnv === '*') {
  corsOrigin = '*';
} else {
  const origins = corsEnv.split(',').map((o) => o.trim()).filter(Boolean);
  corsOrigin = origins.length === 1 ? origins[0] : origins;
}
app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Prevents accidental or malicious request flooding during real-world testing.
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
if (Number.isNaN(windowMs) || windowMs <= 0) {
  throw new Error('[Config] RATE_LIMIT_WINDOW_MS must be a positive integer (milliseconds)');
}
if (Number.isNaN(maxRequests) || maxRequests <= 0) {
  throw new Error('[Config] RATE_LIMIT_MAX must be a positive integer');
}
app.use(
  rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  }),
);

app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/drivers', driversRouter);
app.use('/rides', ridesRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
