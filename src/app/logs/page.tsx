"use client"

import { FaUserPlus } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import Forbidden from '../components/Forbidden';
import { useSession } from 'next-auth/react';
import Header from '../components/Header';


export default function DashboardPage() {
  const { data: session } = useSession();

  const [logGroup, setLogGroup] = useState('/aws/lambda/AppendUserRole');
  const [pages, setPages] = useState('10');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://vm1swtn9ii.execute-api.ap-southeast-1.amazonaws.com/logs/get_logs?logGroup=" + logGroup + "&pageSize=" + pages
          );
          setLogs(response.data.logs);
          setIsLoading(false);
        } catch (err: any) {
        setError(err);
        }
    };
    fetchData();
    
  }, []); 
  
  // Empty dependency array means this useEffect runs once when component mounts

  const filteredLogs = logs.filter(log => {
    // Adjust these conditions to match the actual structure of your log objects
    const matchesSearchTerm = JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase());
    // const withinDateRange = (!startDate || log.timestamp >= startDate) && (!endDate || log.timestamp <= endDate);
    return matchesSearchTerm; // && withinDateRange;
  });

    
  if (!session) {
    return (
      <Forbidden />
    );
  }

  return (
    <div className="bg-gray-100 h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1">
        <Header title="Access Control Logs" />
        <main className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <FiSearch className="text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search logs..."
                className="ml-2 p-1 border rounded"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="flex md:flex-row flex-col">
                <input
                  type="date"
                  placeholder="Start date"
                  max={endDate}
                  className="ml-2 p-1 border rounded text-gray-400"
                  onChange={e => setStartDate(e.target.value)}
                  
                />
                <input
                  type="date"
                  placeholder="End date"
                  min={startDate}
                  className="ml-2 p-1 border rounded text-gray-400"
                  onChange={e => setEndDate(e.target.value)}
                  
                />
              </div>
            </div>
          </div>

          <div className='bg-white rounded shadow p-4 max-h-[500px] overflow-y-auto'>
            <ul role="list" className="divide-y divide-gray-100">
              {error && <p>Error loading data: {(error as Error).message}</p>}
              {!error && isLoading ? (
                <p>Loading...</p>
              ) : (
                filteredLogs.map((log) => (
                  // <li key={log.id} className="flex justify-between gap-x-6 py-5">
                  //   <p className="text-sm leading-6 text-gray-900"> #{log.id}. {log.message}</p>
                  //   <p className="text-sm leading-6 text-gray-500">{log.date} {log.time}</p>
                  // </li>
                  <li key={log} className="flex justify-between gap-x-6 py-5">
                    <p className="text-sm leading-6 text-gray-900"> {log} </p>
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


