exports.getSummary = async (req, res) => {
  try {
    const totalCreditResult = await req.db.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_credit FROM transactions WHERE type = 'credit'
    `);
    const totalDebitResult = await req.db.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_debit FROM transactions WHERE type = 'debit'
    `);
    const totalBalanceResult = await req.db.query(`
      SELECT COALESCE(SUM(balance), 0) AS total_balance FROM accounts
    `);

    res.json({
      total_credit: parseFloat(totalCreditResult.rows[0].total_credit),
      total_debit: parseFloat(totalDebitResult.rows[0].total_debit),
      total_balance: parseFloat(totalBalanceResult.rows[0].total_balance),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};
