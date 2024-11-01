import Redis from 'ioredis';
import { Server } from 'socket.io';
import http from 'http';
import pkg from 'pg';
const { Pool } = pkg;

const redis = new Redis({ host: 'redis', port: 6379 });
const pool = new Pool({ connectionString: 'postgres://user:password@postgres:5432/logs_db' });

// Create an HTTP server
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your frontend's origin
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true
  }
});

// Start the Socket.IO server
server.listen(5000, () => {
  console.log('Socket.IO server is running on port 5000');
});

// Handle Socket.IO connections
io.on('connection', async (socket) => {
  console.log('New Socket.IO client connected');

  // Retrieve recent logs from PostgreSQL for initial display
  try {
    const recentLogs = await pool.query('SELECT service, event, timestamp FROM logs ORDER BY timestamp DESC LIMIT 10');
    recentLogs.rows.forEach((log) => {
      socket.emit('log', log); // Send each log to the Socket.IO client
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
      socket.emit('log', JSON.parse(message)); // Send real-time message to Socket.IO client
    }
  });

  socket.on('disconnect', () => console.log('Socket.IO client disconnected'));
});
