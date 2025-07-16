// kafka/apiLogger.js
const jwt = require('jsonwebtoken'); // make sure this is installed
const { producer } = require('./producer');

const apiLogger = (serviceName) => {
  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', async () => {
      console.log(`[apiLogger] 🔔 Response finished for ${req.method} ${req.originalUrl}`);

      let tenantId = null;

      // 👇 Extract token from Authorization header
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        try {
          const decoded = jwt.decode(token); // no signature verification
          tenantId = decoded?.tenantId;
        } catch (err) {
          console.warn('[apiLogger] ⚠️ Failed to decode token:', err.message);
        }
      }

      if (!tenantId) {
        console.warn('[apiLogger] ⚠️ No tenantId found in token. Skipping log.');
        return;
      }

      const duration = Date.now() - start;

      const log = {
        tenantId,
        service: serviceName,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: duration,
        timestamp: new Date().toISOString(),
      };

      console.log('[apiLogger] 📦 Prepared log:', log);

      try {
        await producer.send({
          topic: 'api-usage',
          messages: [{ value: JSON.stringify(log) }],
        });
        console.log(`[Kafka] 📝 Successfully logged API usage for tenant: ${tenantId}`);
      } catch (err) {
        console.error('[Kafka] ❌ Failed to send log message:', err.message);
      }
    });

    next();
  };
};

module.exports = { apiLogger };
