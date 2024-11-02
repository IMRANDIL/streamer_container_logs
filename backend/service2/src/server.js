import express from 'express';
import { Kafka } from 'kafkajs';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const pool = new Pool({ connectionString: 'postgres://user:password@postgres:5432/logs_db' });

// Set up Kafka producer
const kafka = new Kafka({
  clientId: 'service2-producer', // Change to 'service2-producer' for service2
  brokers: ['kafka:9092'],
});
const producer = kafka.producer();

async function publishLog(event) {
  const logEntry = JSON.stringify({
    service: 'service2', // Change to 'service2' for service2
    event,
    timestamp: new Date(),
  });

  await producer.connect();
  await producer.send({
    topic: 'logTopic',
    messages: [{ value: logEntry }],
  });
}

app.get('/', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  await publishLog('Root endpoint accessed');
  res.json({ message: 'Service 2', dbTime: result.rows[0] }); // Update to 'Service 2' for service2
});

app.listen(4001, () => {
  console.log('Service 2 running on port 4001'); // Update port for service2 to 4001
});
