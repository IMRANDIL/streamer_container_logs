import Redis from 'ioredis';
import pkg from 'pg';
const { Pool } = pkg;

const redis = new Redis({ host: 'redis', port: 6379 });
const pool = new Pool({ connectionString: 'postgres://user:password@postgres:5432/logs_db' });

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

async function writeLogsToPostgres() {
  await connectWithRetry();          // Ensure database connection
  await createLogsTableIfNotExists(); // Ensure the table exists

  while (true) {
    const logs = await redis.lrange('logQueue', 0, -1); // Fetch all logs in Redis
    if (logs.length > 0) {
      await pool.query('BEGIN');
      try {
        for (const log of logs) {
          const { service, event, timestamp } = JSON.parse(log);
          await pool.query(
            'INSERT INTO logs (service, event, timestamp) VALUES ($1, $2, $3)',
            [service, event, timestamp]
          );
          await redis.publish('logs', log); // Publish to Redis for real-time streaming
        }
        await pool.query('COMMIT');
        await redis.ltrim('logQueue', logs.length, -1); // Trim processed logs
      } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Failed to insert logs:', error);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Adjust interval as needed
  }
}

writeLogsToPostgres();
