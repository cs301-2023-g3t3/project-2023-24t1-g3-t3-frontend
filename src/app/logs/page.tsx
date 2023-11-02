"use client"

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Forbidden from '../components/Forbidden';
import { data } from 'autoprefixer';
import { DateTime } from 'luxon';

interface CustomSession {
  user: {
    email: string;
    id: string;
  };
  role: string;
  userId: string;
  accessToken: string;
}

interface Log {
  message: string;
  timestamp: string;
  CLIENT_IP: string;
  LATENCY: string;
  METHOD: string;
  STATUS: string;
  URI: string;
  USER_AGENT: string;
  // ...other properties
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const customSession = session as unknown as CustomSession;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const headers = useMemo(() => {
    return { 'Authorization': `Bearer ${customSession.accessToken}` };
  }, [customSession.accessToken]);

  const [logs, setLogs] = useState<Log[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [service, setService] = useState<string>('points');
  const [clientIp, setClientIp] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const [uri, setUri] = useState('');
  const [userAgent, setUserAgent] = useState('');
  const [latencyMin, setLatencyMin] = useState('');
  const [latencyMax, setLatencyMax] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/logs/get_logs?service=${service}&start=${Math.floor(DateTime.now().minus({ days: 10 }).toSeconds())}&end=${Math.floor(DateTime.now().toSeconds())}`,{ headers });
        console.log(response.data);
        // setLogs(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
      }
    };
    fetchData();
  }, [apiUrl, headers, searchTerm, clientIp, method, status, uri, userAgent, latencyMin, latencyMax]);

  const parseLatency = (latency: string) => parseFloat(latency.replace('ms', ''));

  const filteredLogs = logs.filter(log => {
    const matchesSearchTerm = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClientIp = log.CLIENT_IP.includes(clientIp);
    const matchesMethod = log.METHOD.includes(method);
    const matchesStatus = log.STATUS.includes(status);
    const matchesUri = log.URI.includes(uri);
    const matchesUserAgent = log.USER_AGENT.includes(userAgent);
    const latency = parseLatency(log.LATENCY);
    const isWithinLatencyRange = (latencyMin === '' || latency >= parseLatency(latencyMin)) &&
                                 (latencyMax === '' || latency <= parseLatency(latencyMax));

    return matchesSearchTerm && matchesClientIp && matchesMethod && matchesStatus &&
           matchesUri && matchesUserAgent && isWithinLatencyRange;
  });

  if (!session) {
    return <Forbidden />;
  }

  return (
    <div className="bg-gray-100 h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Header title="Access Control Logs" />
        <main className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-wrap items-center">
              <input
                type="text"
                placeholder="Search logs..."
                className="ml-2 p-1 border rounded"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <input
                type="text"
                placeholder="Filter by Client IP..."
                className="ml-2 p-1 border rounded"
                value={clientIp}
                onChange={e => setClientIp(e.target.value)}
              />
              <input
                type="text"
                placeholder="Filter by Method..."
                className="ml-2 p-1 border rounded"
                value={method}
                onChange={e => setMethod(e.target.value)}
              />
              <input
                type="text"
                placeholder="Filter by Status..."
                className="ml-2 p-1 border rounded"
                value={status}
                onChange={e => setStatus(e.target.value)}
              />
              <input
                type="text"
                placeholder="Filter by URI..."
                className="ml-2 p-1 border rounded"
                value={uri}
                onChange={e => setUri(e.target.value)}
              />
              <input
                type="text"
                placeholder="Filter by User Agent..."
                className="ml-2 p-1 border rounded"
                value={userAgent}
                onChange={e => setUserAgent(e.target.value)}
              />
              <input
                type="number"
                placeholder="Min Latency (ms)..."
                className="ml-2 p-1 border rounded"
                value={latencyMin}
                onChange={e => setLatencyMin(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max Latency (ms)..."
                className="ml-2 p-1 border rounded"
                value={latencyMax}
                onChange={e => setLatencyMax(e.target.value)}
              />
            </div>
          </div>

          <div className='bg-white rounded shadow p-4 max-h-[500px] overflow-y-auto'>
            <ul role="list" className="divide-y divide-gray-100">
              {error && <p>Error loading data: {error.message}</p>}
              {!error && isLoading ? (
                <p>Loading...</p>
              ) : (
                filteredLogs.map((log, index) => (
                  <li key={index} className="flex justify-between gap-x-6 py-5">
                    <p className="text-sm leading-6 text-gray-900">{log.message}</p>
                    <p className="text-sm leading-6 text-gray-500">{log.timestamp}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
