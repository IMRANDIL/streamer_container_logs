import React, { useEffect, useState } from 'react';

const LogStream: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    ws.onmessage = (event) => setLogs((prevLogs: any) => [...prevLogs, event.data]);
    return () => ws.close();
  }, []);
  return (
    <div>
      <h2>Real-Time Logs</h2>
      <ul>
        {logs.map((log: string, index: number) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default LogStream;
