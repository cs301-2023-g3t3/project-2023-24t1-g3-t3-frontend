"use client"

import { FaUserPlus } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  const logs = [
    {
      id: 1,
      message: 'Account #1 logged in',
      date: '2021-09-01',
      time: '09:30:00',
    },
    {
      id: 2,
      message: 'Account #2 logged in',
      date: '2021-09-01',
      time: '10:15:00',
    },
    {
      id: 3,
      message: 'Account #1 changed password',
      date: '2021-09-02',
      time: '11:20:00',
    },
    {
      id: 4,
      message: 'Account #3 logged in',
      date: '2021-09-02',
      time: '12:45:00',
    },
    {
      id: 5,
      message: 'Account #2 upgraded to Engineer role',
      date: '2021-09-03',
      time: '14:10:00',
    },
    {
      id: 6,
      message: 'Account #4 logged in',
      date: '2021-09-03',
      time: '15:30:00',
    },
    {
      id: 7,
      message: 'Account #3 changed profile picture',
      date: '2021-09-04',
      time: '16:25:00',
    },
    {
      id: 8,
      message: 'Account #1 promoted to Owner role',
      date: '2021-09-05',
      time: '17:40:00',
    },
    {
      id: 9,
      message: 'Account #4 changed email address',
      date: '2021-09-06',
      time: '18:55:00',
    },
    {
      id: 10,
      message: 'Account #2 deactivated',
      date: '2021-09-07',
      time: '19:15:00',
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const filteredLogs = logs.filter(log => {
    const matchesSearchTerm = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const withinDateRange = (!startDate || log.date >= startDate) && (!endDate || log.date <= endDate);
    
    return matchesSearchTerm && withinDateRange;
  });
  

  return (
    <div className="bg-gray-100 h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1">
        <header className="bg-white p-4 flex justify-between">
          <h1 className="text-xl font-bold text-gray-700">Access Control Logs</h1>
          <Link href="/" className='mr-4 text-gray-500'>Log out</Link>
        </header>
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

          {/* Users */} 
          <div className='bg-white rounded shadow p-4 max-h-[500px] overflow-y-auto'>
            <ul role="list" className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <li key={log.id} className="flex justify-between gap-x-6 py-5">
                  <p className="text-sm leading-6 text-gray-900"> #{log.id}. {log.message}</p>
                  <p className="text-sm leading-6 text-gray-500">{log.date} {log.time}</p>
                </li>
              ))}
            </ul>
          </div>
          
          
        </main>
      </div>
    </div>
  );
}
