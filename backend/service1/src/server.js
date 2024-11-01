import express from 'express';
import Redis from 'ioredis';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const redis = new Redis({
  host: 'redis', 
  port: 6379     
});

const pool = new Pool({ connectionString: 'postgres://user:password@postgres:5432/logs_db' });

// Log data to Redis as a list entry for batch processing
async function publishLog(event) {
  const logEntry = JSON.stringify({ service: 'service1', event, timestamp: new Date() });
  await redis.rpush('logQueue', logEntry); // Push log to Redis list for batch processing
}

app.get('/', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  await publishLog('Root endpoint accessed');
  res.json({ message: 'Service 1', dbTime: result.rows[0] });
});

app.listen(4000, () => {
  console.log('Service 1 running on port 4000');
});
