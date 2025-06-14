const { Pool } = require('pg');
const generateTenantSchemas = require('./generateTenantSchemas');
const logger = require('../auth/logger'); // adjust path as needed

const TENANT_DB_PREFIX = process.env.TENANT_DB_PREFIX; // e.g. postgres://user:pass@host:5432
const SHARED_URI = process.env.SHARED_DB_URI;

const tenantPools = {};

function getTenantPool(tenantId) {
  if (!tenantId) throw new Error('Missing tenantId');

  if (!tenantPools[tenantId]) {
    const dbName = `cbas_${tenantId}`;
    const url = new URL(TENANT_DB_PREFIX);

    tenantPools[tenantId] = new Pool({
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      host: url.hostname,
      port: parseInt(url.port, 10),
      database: dbName,
    });

    logger.info(`📡 New tenant DB pool created for: ${dbName}`);
  }

  return tenantPools[tenantId];
}

async function createTenantDatabase(tenantId) {
  const dbName = `cbas_${tenantId}`;
  const url = new URL(TENANT_DB_PREFIX);

  // Step 1: Connect to the shared DB to create a new tenant DB
  const basePool = new Pool({ connectionString: SHARED_URI });
  try {
    await basePool.query(`CREATE DATABASE ${dbName}`);
    logger.info(`✅ Tenant DB created: ${dbName}`);
  } catch (err) {
    if (err.code === '42P04') {
      logger.warn(`⚠️ Database ${dbName} already exists`);
    } else {
      logger.error(`❌ Error creating tenant database: ${err.message}`);
      throw err;
    }
  } finally {
    await basePool.end();
  }

  // Step 2: Connect to the tenant DB and initialize schema
  const config = {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: parseInt(url.port, 10),
    database: dbName,
  };

  const tenantPool = new Pool(config);

  try {
    await generateTenantSchemas(tenantPool);
    logger.info(`✅ Tables created for tenant DB: ${dbName}`);
  } catch (err) {
    logger.error(`❌ Error generating tenant schema: ${err.message}`);
    throw err;
  } finally {
    await tenantPool.end();
  }
}

module.exports = { createTenantDatabase, getTenantPool };
