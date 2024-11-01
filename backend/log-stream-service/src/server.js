import Redis from 'ioredis';
import { WebSocketServer } from 'ws';

// Specify the Redis host as 'redis', matching the service name in docker-compose.yml
const redis = new Redis({
  host: 'redis', // Docker service name for Redis
  port: 6379     // Default Redis port
});

const wss = new WebSocketServer({ port: 5000 });

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');

  redis.subscribe('logs', (error) => {
    if (error) console.error('Redis subscription error:', error);
  });

  redis.on('message', (channel, message) => {
    if (channel === 'logs') {
      ws.send(message);
    }
  });

  ws.on('close', () => console.log('WebSocket client disconnected'));
});
