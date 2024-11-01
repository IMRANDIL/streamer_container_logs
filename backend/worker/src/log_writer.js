import Redis from 'ioredis';
import pkg from 'pg';
const { Pool } = pkg;

const redis = new Redis({ host: 'redis', port: 6379 });
const pool = new Pool({ connectionString: 'postgres://user:password@postgres:5432/logs_db' });

async function writeLogsToPostgres() {
  while (true) {
    const logs = await redis.lrange('logQueue', 0, -1); // Fetch all logs
    if (logs.length > 0) {
      await pool.query('BEGIN');
      try {
        for (const log of logs) {
          const { service, event, timestamp } = JSON.parse(log);
          await pool.query('INSERT INTO logs (service, event, timestamp) VALUES ($1, $2, $3)', [service, event, timestamp]);
          await redis.publish('logs', log); // Republish to Redis channel for real-time streaming
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
