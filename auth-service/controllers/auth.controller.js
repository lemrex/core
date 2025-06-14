const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sharedDb = require('../db/sharedDb');
const { createTenantDatabase } = require('../db/tenantDbManager');
const logger = require('../auth/logger');

exports.register = async (req, res) => {
  const { tenantName, email, password } = req.body;

  if (!tenantName || !email || !password) {
    logger.warn('Registration attempt with missing fields');
    return res.status(400).json({ error: 'All fields are required' });
  }

  const rawTenant = tenantName.toLowerCase().replace(/\s+/g, '_');
  const tenantId = rawTenant + '_' + uuidv4().slice(0, 6).replace(/-/g, '');
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    logger.info(`Registering tenant: ${tenantId}`);

    await sharedDb.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        tenant_id TEXT NOT NULL
      )
    `);

    await sharedDb.query(
      `INSERT INTO users (id, email, password, tenant_id) VALUES ($1, $2, $3, $4)`,
      [uuidv4(), email, hashedPassword, tenantId]
    );

    await createTenantDatabase(tenantId);

    const token = jwt.sign({ email, tenantId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    logger.info(`Tenant registered successfully: ${tenantId}`);
    res.json({ message: 'Tenant registered successfully', token, tenantId });
  } catch (err) {
    logger.error(`Registration failed: ${err.message}`);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    logger.info(`Login attempt for ${email}`);

    const result = await sharedDb.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      logger.warn(`Login failed for ${email}: User not found`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn(`Login failed for ${email}: Incorrect password`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: user.email, tenantId: user.tenant_id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    logger.info(`Login successful for ${email}`);
    res.json({ message: 'Login successful', token });
  } catch (err) {
    logger.error(`Login error for ${email}: ${err.message}`);
    res.status(500).json({ error: 'Login failed' });
  }
};

// exports.verifyToken = (req, res) => {
//   const { token } = req.body;

//   if (!token) {
//     logger.warn('Token verification failed: No token provided');
//     return res.status(400).json({ error: 'Token required' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     logger.info(`Token verified successfully for ${decoded.email}`);
//     return res.json({ valid: true, payload: decoded });
//   } catch (err) {
//     logger.error(`Token verification failed: ${err.message}`);
//     return res.status(401).json({ valid: false, error: 'Invalid token' });
//   }
// };