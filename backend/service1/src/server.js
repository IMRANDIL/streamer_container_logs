// backend/service1/src/server.js (same for service2)
import express from 'express';
import Redis from 'ioredis';
import { Pool } from 'pg';

const app = express();
const redis = new Redis(); // Connect to Redis
const pool = new Pool({ connectionString: 'postgres://user:password@postgres:5432/logs_db' });

// Log data to Redis
function publishLog(event) {
  redis.publish('logs', JSON.stringify({ service: 'service1', event, timestamp: new Date() }));
}

app.get('/', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  publishLog('Root endpoint accessed');
  res.json({ message: 'Service 1', dbTime: result.rows[0] });
});

app.listen(4000, () => {
  console.log('Service 1 running on port 4000');
});
