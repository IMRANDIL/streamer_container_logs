import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #1e1e2e;
  color: #d1d1d1;
  padding: 20px;
  height: 100vh;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
`;

const Title = styled.h2`
  color: #ffbe0b;
  font-size: 2rem;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
`;

const LogList = styled.ul`
  list-style: none;
  width: 80%;
  max-height: 80%;
  overflow-y: auto;
  padding: 10px;
  margin: 0;
  background: #2d2d44;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ffbe0b;
    border-radius: 10px;
  }
`;

const LogItem = styled.li`
  background: #353555;
  margin: 8px 0;
  padding: 15px;
  border-radius: 5px;
  color: #ffffff;
  font-size: 1rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
    background: #47477a;
  }
`;

const LogStream: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    ws.onmessage = (event) => setLogs((prevLogs) => [...prevLogs, event.data]);
    return () => ws.close();
  }, []);

  return (
    <Container>
      <Title>Real-Time Logs</Title>
      <LogList>
        {logs.map((log, index) => (
          <LogItem key={index}>{log}</LogItem>
        ))}
      </LogList>
    </Container>
  );
};

export default LogStream;
