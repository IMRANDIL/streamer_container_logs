import React, { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import debounce from 'lodash.debounce';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const LogStream: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('log', (log) => {
      setLogs((prevLogs) => {
        const updatedLogs = [...prevLogs, log];
        setFilteredLogs(updatedLogs);
        return updatedLogs;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = useCallback(
    debounce((date: Date | null) => {
      if (date) {
        const dateString = date.toISOString().split('T')[0];
        const filtered = logs.filter((log) => log.timestamp.startsWith(dateString));
        setFilteredLogs(filtered);
      } else {
        setFilteredLogs(logs);
      }
    }, 300),
    [logs]
  );

  useEffect(() => {
    handleSearch(selectedDate);
  }, [selectedDate, handleSearch]);

  return (
    <div className="container">
      <h2 className="title">Real-Time Logs</h2>
      <div className="search-container">
        <label htmlFor="date-picker" className="date-label">Filter by Date:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          placeholderText="Select a date"
          dateFormat="yyyy-MM-dd"
          id="date-picker"
          isClearable
          className="date-picker"
        />
      </div>
      <ul className="log-list">
        {filteredLogs.map((log, index) => (
          <li key={index} className="log-item">
            {JSON.stringify(log)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogStream;
