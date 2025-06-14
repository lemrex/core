const express = require('express');
const jwt = require('jsonwebtoken');
const logger = require('../auth/logger');
const router = express.Router();

router.post('/verify', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  // Decode token without verifying just to get tenantId for logging
  try {
    const decodedForLog = jwt.decode(token);
    if (decodedForLog && decodedForLog.tenantId) {
      logger.info(`Incoming token from tenant: ${decodedForLog.tenantId}`);
    } else {
      logger.info('Incoming token (no tenantId found)');
    }
  } catch {
    logger.info('Incoming token (failed to decode)');
  }

  // Now verify token signature properly
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true, payload: decoded });
  } catch (err) {
    logger.error(`Token verification failed: ${err.message}`);
    return res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

module.exports = router;
