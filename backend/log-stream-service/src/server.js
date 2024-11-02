import { Kafka } from 'kafkajs';
import { Server } from 'socket.io';
import http from 'http';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: 'postgres://user:password@postgres:5432/logs_db' });

// Kafka configuration
const kafka = new Kafka({
  clientId: 'log-stream',
  brokers: ['kafka:9092'], // Replace with your Kafka broker(s)
});

const consumer = kafka.consumer({ groupId: 'log-stream-group' });

// Create an HTTP server
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your frontend's origin
    methods: ["GET", "POST"],
  }
});

// Start the Socket.IO server
server.listen(5000, () => {
  console.log('Socket.IO server is running on port 5000');
});

// Retry connection to Kafka
async function connectWithRetry() {
  let connected = false;
  while (!connected) {
    try {
      await consumer.connect();
      console.log('Connected to Kafka');
      connected = true;
    } catch (error) {
      console.error('Failed to connect to Kafka, retrying in 5 seconds...', error);
      await new Promise(res => setTimeout(res, 5000)); // Wait for 5 seconds before retrying
    }
  }
}

// Kafka consumer to stream logs
async function startKafkaConsumer() {
  await connectWithRetry();
  await consumer.subscribe({ topic: 'logTopic', fromBeginning: false });

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const log = JSON.parse(message.value.toString());
      
      io.emit('log', log); // Send real-time log message to all connected clients
    },
  });
}

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

  socket.on('disconnect', () => console.log('Socket.IO client disconnected'));
});

// Start Kafka consumer to consume and emit logs in real-time
startKafkaConsumer().catch(console.error);
