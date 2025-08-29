import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import statsRoutes from './routes/stats.js';
import { startConsumer } from './kafka/consumer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS (allow all origins or configure as needed)
// app.use(cors());

app.use(
  cors({
    origin: ['http://analytics.ralf.com.ng'], // allow your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON bodies
app.use(express.json());

// Mount stats route
app.use('/stats', statsRoutes);

// Start Kafka consumer
startConsumer().catch((err) => {
  console.error('❌ Failed to start usage service:', err.message);
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`🚀 Usage service API running at http://localhost:${PORT}`);
});
