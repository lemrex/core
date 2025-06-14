require('dotenv').config();
const express = require('express');
const app = express();
const accountRoutes = require('./routes/account.routes');
const summaryRoutes = require('./routes/account.routes');
const verifyToken = require('./middleware/verifyToken');


app.use(express.json());
app.use(verifyToken);
app.use('/api/accounts', accountRoutes);
app.use('/api/summary', accountRoutes);
app.use('/api/summary', summaryRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Account service running on port ${PORT}`);
});
