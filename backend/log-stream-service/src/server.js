import Redis from 'ioredis';
import { WebSocketServer } from 'ws';
import pkg from 'pg';
const { Pool } = pkg;

const redis = new Redis({ host: 'redis', port: 6379 });
const pool = new Pool({ connectionString: 'postgres://user:password@postgres:5432/logs_db' });

const wss = new WebSocketServer({ port: 5000 });

wss.on('connection', async (ws) => {
  console.log('New WebSocket client connected');

  // Retrieve recent logs from PostgreSQL for initial display
  try {
    const recentLogs = await pool.query('SELECT service, event, timestamp FROM logs ORDER BY timestamp DESC LIMIT 10');
    recentLogs.rows.forEach((log) => {
      ws.send(JSON.stringify(log)); // Send each log to the WebSocket client
    });
  } catch (error) {
    console.error('Failed to fetch recent logs:', error);
  }

  // Subscribe to Redis for real-time streaming
  redis.subscribe('logs', (error) => {
    if (error) console.error('Redis subscription error:', error);
  });

  redis.on('message', (channel, message) => {
    if (channel === 'logs') {
      ws.send(message); // Send real-time message to WebSocket client
    }
  });

  ws.on('close', () => console.log('WebSocket client disconnected'));
});
