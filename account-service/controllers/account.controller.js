const generateId = require('../utils/generateId');
const logger = require('../accounts/logger');

exports.createAccount = async (req, res) => {
  const { name } = req.body;
  const id = generateId();
  const tenantId = req.user?.tenantId;

  try {
    await req.db.query(
      `INSERT INTO accounts (id, name, balance) VALUES ($1, $2, $3)`,
      [id, name, 0]
    );

    logger.info(`Account created: ID=${id}, Name=${name}, Tenant=${tenantId || 'unknown'}`);
    res.json({ message: 'Account created', id, name, balance: 0 });
  } catch (err) {
    logger.error(`Failed to create account: ${err.message}`);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

exports.getAccountById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await req.db.query(
      `SELECT * FROM accounts WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      logger.warn(`Account not found: ID=${id}`);
      return res.status(404).json({ error: 'Account not found' });
    }

    logger.info(`Account fetched: ID=${id}`);
    res.json(result.rows[0]);
  } catch (err) {
    logger.error(`Error fetching account ID=${id}: ${err.message}`);
    res.status(500).json({ error: 'Error fetching account' });
  }
};

exports.getAllAccounts = async (req, res) => {
  try {
    const result = await req.db.query('SELECT * FROM accounts');

    logger.info(`Fetched all accounts, count=${result.rows.length}`);
    res.json(result.rows);
  } catch (err) {
    logger.error(`Failed to fetch all accounts: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};
