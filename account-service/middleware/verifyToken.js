const axios = require('axios');
const logger = require('../accounts/logger'); // adjust path as needed

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    logger.error('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const response = await axios.post(process.env.AUTH_VERIFY_URL, { token });


    if (!response.data.valid || !response.data.payload) {
      logger.error('Invalid token or missing payload');
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = response.data.payload;

    logger.info(`Token verification succeeded for tenant: ${req.user.tenantId}`);
    next();
  } catch (err) {
    logger.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
