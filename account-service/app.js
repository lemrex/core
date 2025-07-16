require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const accountRoutes = require('./routes/account.routes');
const verifyToken = require('./middleware/verifyToken');
const { connectProducer } = require('./kafka/producer');
const { apiLogger } = require('./kafka/apiLogger');

(async () => {
  try {
    // ✅ Connect Kafka
    await connectProducer();

    // ✅ Middleware
    app.use(cors());
    app.use(express.json());

    // ✅ Verify JWT before protected routes
    app.use(verifyToken);

    // ✅ Log every request AFTER token is verified
    app.use(apiLogger('account-service'));

    // ✅ Define routes
    app.use('/api/accounts', accountRoutes);
    app.use('/api/summary', accountRoutes);


    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      console.log(`🚀 Account service running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
})();
