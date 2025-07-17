import { Kafka } from 'kafkajs';
import { pool } from '../db/index.js';
import dotenv from 'dotenv';
dotenv.config();

const kafka = new Kafka({
  clientId: 'usage-service',
  brokers: process.env.KAFKA_BROKERS.split(','),
});

const consumer = kafka.consumer({ groupId: 'usage-logger' });

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });

  console.log('🚀 Kafka consumer ready...');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const log = JSON.parse(message.value.toString());
        const {
          tenantId,
          service,
          method,
          path,
          status,
          durationMs,
          timestamp,
        } = log;

        await pool.query(
          `INSERT INTO api_usage_logs (tenant_id, service, method, path, status, duration_ms, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [tenantId, service, method, path, status, durationMs, timestamp]
        );

        console.log(`✅ Logged usage for tenant: ${tenantId}`);
      } catch (err) {
        console.error('❌ Error processing log:', err.message);
      }
    },
  });
};
