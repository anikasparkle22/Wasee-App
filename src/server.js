'use strict';

require('dotenv').config();
const app = require('./app');
const { client: redis } = require('./redis');

const PORT = parseInt(process.env.PORT || '3000', 10);

async function main() {
  app.listen(PORT, () => {
    console.log(`[Server] Wasee API listening on port ${PORT}`);
  });

  // Connect to Redis in the background so the HTTP server is always available.
  // ioredis will automatically retry the connection if it fails on startup.
  // Ongoing connection errors (retries) are handled by the `error` event listener
  // registered in redis.js.
  redis.connect().then(() => {
    console.log('[Redis] connected');
  }).catch((err) => {
    console.error('[Redis] initial connection failed, will retry automatically:', err.message);
  });
}

main().catch((err) => {
  console.error('[Server] failed to start:', err);
  process.exit(1);
});
