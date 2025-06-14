const express = require('express');
const cors = require('cors'); 
require('dotenv').config();
const transactionRoutes = require('./routes/transaction.routes');
const verifyToken = require('./middleware/verifyToken');

const app = express();
app.use(cors()); 
app.use(express.json());
app.use(verifyToken);
app.use('/api/transaction', transactionRoutes);
app.use('/api/summary', require('./routes/summary.routes'));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`💸 Transaction service running on port ${PORT}`);
});
