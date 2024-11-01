import express from 'express';
import Redis from 'ioredis';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();

// Connect to Redis using the service name defined in docker-compose.yml
const redis = new Redis({
  host: 'redis', // Docker Compose service name for Redis
  port: 6379     // Redis default port
});

const pool = new Pool({ connectionString: 'postgres://user:password@postgres:5432/logs_db' });

// Log data to Redis
function publishLog(event) {
  redis.publish('logs', JSON.stringify({ service: 'service2', event, timestamp: new Date() }));
}

app.get('/', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  publishLog('Root endpoint accessed');
  res.json({ message: 'Service 2', dbTime: result.rows[0] });
});

app.listen(4001, () => {
  console.log('Service 2 running on port 4001');
});
