const { Pool } = require('pg');
const logger = require('../transaction/logger'); // import logger from transactions microservice

const TENANT_DB_PREFIX = process.env.TENANT_DB_PREFIX; // e.g. postgres://user:pass@host:5432

const tenantPools = {};

function getTenantPool(tenantId) {
  if (!tenantId) {
    logger.error('TenantPoolResolver: Missing tenantId');
    throw new Error('Missing tenantId');
  }

  logger.info(`TenantPoolResolver: Resolving pool for tenantId: ${tenantId}`);

  if (!tenantPools[tenantId]) {
    try {
      const dbName = `cbas_${tenantId}`;
      const url = new URL(TENANT_DB_PREFIX);

      tenantPools[tenantId] = new Pool({
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        host: url.hostname,
        port: parseInt(url.port, 10),
        database: dbName,
      });

      logger.info(`TenantPoolResolver: New tenant DB pool created for database: ${dbName}`);
    } catch (err) {
      logger.error(`TenantPoolResolver: Failed to create DB pool for tenantId ${tenantId}: ${err.message}`);
      throw err;
    }
  }

  return tenantPools[tenantId];
}

module.exports = { getTenantPool };
