import express from 'express';
import { pool } from '../db/index.js';
const router = express.Router();

// Summary per tenant
router.get('/summary', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT tenant_id, COUNT(*) AS total_calls,
           ROUND(AVG(duration_ms), 2) AS avg_response_time,
           ROUND(100.0 * COUNT(*) FILTER (WHERE status BETWEEN 200 AND 299) / COUNT(*), 2) AS success_rate
    FROM api_usage_logs
    GROUP BY tenant_id
    ORDER BY total_calls DESC;
  `);
  res.json(rows);
});

// Top endpoints per service
router.get('/top-endpoints', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT service, path, COUNT(*) AS calls
    FROM api_usage_logs
    GROUP BY service, path
    ORDER BY calls DESC
    LIMIT 10;
  `);
  res.json(rows);
});


router.get('/monthly-cost', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        tenant_id,
        DATE_TRUNC('month', timestamp) AS month,
        COUNT(*) AS total_calls,
        ROUND(COUNT(*) * 7.5, 2) AS total_cost_usd
      FROM api_usage_logs
      GROUP BY tenant_id, month
      ORDER BY month DESC, total_cost_usd DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Failed to fetch monthly cost:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Time-based request graph
router.get('/requests-per-hour', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT DATE_TRUNC('hour', timestamp) AS hour, COUNT(*) AS requests
    FROM api_usage_logs
    WHERE timestamp >= NOW() - INTERVAL '1 day'
    GROUP BY hour
    ORDER BY hour;
  `);
  res.json(rows);
});

export default router;
