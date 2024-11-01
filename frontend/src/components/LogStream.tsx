import React, { useEffect, useState } from 'react';


const LogStream: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    ws.onmessage = (event) => setLogs((prevLogs) => [...prevLogs, event.data]);
    return () => ws.close();
  }, []);

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
