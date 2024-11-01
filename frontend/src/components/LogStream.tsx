import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const LogStream: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Initialize the Socket.IO connection
    const socket = io('http://localhost:5000'); // Connect to the Socket.IO server

    // Listen for 'log' events from the server
    socket.on('log', (log) => {
      setLogs((prevLogs) => [...prevLogs, JSON.stringify(log)]); // Add new log to the state
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect(); // Disconnect the Socket.IO client
    };
  }, []); // Empty dependency array to ensure this runs only once

  return (
    <div className="container">
      <h2 className="title">Real-Time Logs</h2>
      <ul className="log-list">
        {logs.map((log, index) => (
          <li key={index} className="log-item">{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default LogStream;
