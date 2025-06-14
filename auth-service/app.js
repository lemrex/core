require('dotenv').config();
const cors = require('cors'); 
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes');

app.use(cors()); 
app.use(express.json());
app.use('/api', authRoutes);
app.use('/', require('./routes/token'));



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
