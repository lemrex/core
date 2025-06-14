const { Pool } = require('pg');
const logger = require('../auth/logger'); // Import transaction logger

const sharedDb = new Pool({
  connectionString: process.env.SHARED_DB_URI,
});

sharedDb.on('connect', () => {
  logger.info('SharedDb: Connected to shared database');
});

sharedDb.on('error', (err) => {
  logger.error(`SharedDb: Database error - ${err.message}`);
});

module.exports = sharedDb;
