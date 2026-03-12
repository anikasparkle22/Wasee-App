'use strict';

require('dotenv').config();
const express = require('express');
const driversRouter = require('./routes/drivers');
const ridesRouter = require('./routes/rides');
const errorHandler = require('./middleware/errorHandler');

const app = express();

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
