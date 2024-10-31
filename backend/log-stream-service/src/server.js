import Redis from 'ioredis';
import { WebSocketServer } from 'ws';

const redis = new Redis();
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
