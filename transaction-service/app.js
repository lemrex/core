const express = require('express');
const cors = require('cors'); 
require('dotenv').config();

const transactionRoutes = require('./routes/transaction.routes');
const summaryRoutes = require('./routes/summary.routes');
const verifyToken = require('./middleware/verifyToken');
const { connectProducer } = require('./kafka/producer');
const { apiLogger } = require('./kafka/apiLogger');

const app = express();

(async () => {
  try {
    // 1. Connect Kafka producer
    await connectProducer();

    // 2. Apply global middlewares
    app.use(cors());
    app.use(express.json());

    // 3. Apply JWT verification and logger only to protected routes
    app.use(verifyToken);
    app.use(apiLogger('transaction-service'));

    // 4. Route definitions
    app.use('/api/transaction', transactionRoutes);
    app.use('/api/summary', summaryRoutes);

    // 5. Start server
    const PORT = process.env.PORT || 3003;
    app.listen(PORT, () => {
      console.log(`💸 Transaction service running on port ${PORT}`);
    });
    
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
})();
