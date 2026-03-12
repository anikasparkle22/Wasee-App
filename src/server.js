'use strict';

require('dotenv').config();
const app = require('./app');
const { client: redis } = require('./redis');

const PORT = parseInt(process.env.PORT || '3000', 10);

async function main() {
  await redis.connect();
  console.log('[Redis] connected');
  app.listen(PORT, () => {
    console.log(`[Server] Wasee API listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('[Server] failed to start:', err);
  process.exit(1);
});
