// kafka/producer.js
const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'account-service',
  brokers: [
    '121.91.158.142:9094',
    '203.123.80.126:9094',
    '110.238.75.61:9094',
  ],
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner, // optional: remove warning
});

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('[Kafka] ✅ Producer connected');
  } catch (err) {
    console.error('[Kafka] ❌ Failed to connect:', err.message);
    throw err;
  }
};

module.exports = {
  producer,
  connectProducer,
};
