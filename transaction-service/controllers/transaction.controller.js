const generateId = require('../utils/generateId');
const logger = require('../transaction/logger');

exports.credit = async (req, res) => {
  const { account_id, amount } = req.body;

  try {
    const result = await req.db.query(`SELECT * FROM accounts WHERE id = $1`, [account_id]);

    if (result.rows.length === 0) {
      logger.warn(`Credit failed: Account not found, ID=${account_id}`);
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = result.rows[0];
    const newBalance = Number(account.balance) + amount;
    const transactionId = generateId();
    const createdAt = new Date();

    await req.db.query('BEGIN');
    await req.db.query(
      `INSERT INTO transactions (id, account_id, type, amount, created_at) VALUES ($1, $2, 'credit', $3, $4)`,
      [transactionId, account_id, amount, createdAt]
    );
    await req.db.query(`UPDATE accounts SET balance = $1 WHERE id = $2`, [newBalance, account_id]);
    await req.db.query('COMMIT');

    logger.info(`Credit successful: TxID=${transactionId}, AccountID=${account_id}, Amount=${amount}, NewBalance=${newBalance}`);

    res.json({
      message: 'Credit successful',
      transactionId,
      account_id,
      amount,
      newBalance,
      type: 'credit',
      created_at: createdAt
    });
  } catch (err) {
    await req.db.query('ROLLBACK');
    logger.error(`Credit failed for AccountID=${account_id}: ${err.message}`);
    res.status(500).json({ error: 'Credit failed' });
  }
};

exports.debit = async (req, res) => {
  const { account_id, amount } = req.body;

  try {
    const result = await req.db.query(`SELECT * FROM accounts WHERE id = $1`, [account_id]);

    if (result.rows.length === 0) {
      logger.warn(`Debit failed: Account not found, ID=${account_id}`);
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = result.rows[0];
    if (account.balance < amount) {
      logger.warn(`Debit failed: Insufficient funds, AccountID=${account_id}, Balance=${account.balance}, AttemptedDebit=${amount}`);
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    const newBalance = Number(account.balance) - amount;
    const transactionId = generateId();
    const createdAt = new Date();

    await req.db.query('BEGIN');
    await req.db.query(
      `INSERT INTO transactions (id, account_id, type, amount, created_at) VALUES ($1, $2, 'debit', $3, $4)`,
      [transactionId, account_id, amount, createdAt]
    );
    await req.db.query(`UPDATE accounts SET balance = $1 WHERE id = $2`, [newBalance, account_id]);
    await req.db.query('COMMIT');

    logger.info(`Debit successful: TxID=${transactionId}, AccountID=${account_id}, Amount=${amount}, NewBalance=${newBalance}`);

    res.json({
      message: 'Debit successful',
      transactionId,
      account_id,
      amount,
      newBalance,
      type: 'debit',
      created_at: createdAt
    });
  } catch (err) {
    await req.db.query('ROLLBACK');
    logger.error(`Debit failed for AccountID=${account_id}: ${err.message}`);
    res.status(500).json({ error: 'Debit failed' });
  }
};

exports.getTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await req.db.query(`SELECT * FROM transactions WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      logger.warn(`Transaction not found: ID=${id}`);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    logger.info(`Transaction fetched: ID=${id}`);

    const tx = result.rows[0];
    res.json({
      id: tx.id,
      account_id: tx.account_id,
      type: tx.type,
      amount: tx.amount,
      created_at: tx.created_at
    });
  } catch (err) {
    logger.error(`Failed to fetch transaction ID=${id}: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

exports.getRecentTransactions = async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10'
    );

    logger.info(`Fetched recent transactions, count=${result.rows.length}`);
    res.json(result.rows);
  } catch (err) {
    logger.error(`Failed to fetch recent transactions: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};
