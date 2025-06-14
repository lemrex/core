const logger = require('../auth/logger'); // adjust path as needed

module.exports = async function generateTenantSchemas(pool) {
  try {
    // Create accounts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        balance NUMERIC DEFAULT 0
      );
    `);

    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY,
        account_id UUID REFERENCES accounts(id),
        type VARCHAR(10) NOT NULL, -- credit or debit
        amount NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    logger.error('❌ Error creating tables: ' + err.message);
    throw err;
  }
};
