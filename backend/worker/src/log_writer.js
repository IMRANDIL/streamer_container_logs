import { Kafka } from 'kafkajs';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: 'postgres://user:password@postgres:5432/logs_db' });

// Kafka configuration
const kafka = new Kafka({
  clientId: 'log-writer',
  brokers: ['kafka:9092'], // Replace with your Kafka broker(s)
});

const consumer = kafka.consumer({ groupId: 'log-writer-group' });

// Retry logic for connecting to PostgreSQL
async function connectWithRetry() {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await pool.query('SELECT 1'); // Simple query to check the connection
      console.log('Connected to PostgreSQL');
      return;
    } catch (error) {
      console.error(`Attempt ${attempt} to connect to PostgreSQL failed:`, error);
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error('Could not connect to PostgreSQL after multiple attempts. Exiting.');
        process.exit(1);
      }
    }
  }
}

async function createLogsTableIfNotExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      service VARCHAR(255) NOT NULL,
      event TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL
    );
  `;
  await pool.query(createTableQuery);
}

// Function to write logs to PostgreSQL
async function writeLogToPostgres(log) {
  const { service, event, timestamp } = JSON.parse(log);

  try {
    await pool.query(
      'INSERT INTO logs (service, event, timestamp) VALUES ($1, $2, $3)',
      [service, event, timestamp]
    );
    console.log(`Log inserted: ${log}`);
  } catch (error) {
    console.error('Failed to insert log:', error);
  }
}

async function startKafkaConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'logTopic', fromBeginning: true }); // Subscribe to Kafka topic

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const log = message.value.toString();
      await writeLogToPostgres(log); // Process and write log to PostgreSQL
    },
  });
}

(async () => {
  await connectWithRetry();          // Ensure database connection
  await createLogsTableIfNotExists(); // Ensure the table exists
  await startKafkaConsumer();         // Start consuming logs from Kafka
})();
