const { getTenantPool } = require('../db/tenantDbManager');
const logger = require('../accounts/logger'); // adjust path as needed

module.exports = function (req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Missing user info in request' });
    }

    const { tenantId } = req.user;

    if (!tenantId) {
      return res.status(401).json({ error: 'Missing tenantId in token' });
    }

    logger.info(`Resolving DB pool for tenantId: ${tenantId}`);

    const db = getTenantPool(tenantId);
    req.db = db;
    next();
  } catch (err) {
    logger.error(`Tenant Resolver Error: ${err.message}`);
    return res.status(500).json({ error: 'Unable to resolve tenant database' });
  }
};
