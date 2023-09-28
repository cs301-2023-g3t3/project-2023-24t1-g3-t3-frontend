"use client"

import { FaUserPlus } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  const people = [
    {
      id : 1,
      name: 'Leslie Alexander',
      email: 'leslie.alexander@example.com',
      role: 'Owner',
      pointsBalance: 1200,
      enrollmentDate: '2021-06-15',
      logsCount: 50,
      imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id : 2,
      name: 'Michael Foster',
      email: 'michael.foster@example.com',
      role: 'Manager',
      pointsBalance: 810,
      enrollmentDate: '2021-06-15',
      logsCount: 50,
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id : 3,
      name: 'Dries Vincent',
      email: 'dries.vincent@example.com',
      role: 'Manager',
      pointsBalance: 532,
      enrollmentDate: '2021-06-15',
      logsCount: 50,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id : 4,
      name: 'Lindsay Walton',
      email: 'lindsay.walton@example.com',
      role: 'Engineer',
      pointsBalance: 980,
      enrollmentDate: '2021-06-15',
      logsCount: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id : 5,
      name: 'Courtney Henry',
      email: 'courtney.henry@example.com',
      role: 'Product Manager',
      pointsBalance: 1520,
      enrollmentDate: '2021-06-15',
      logsCount: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id : 6,
      name: 'Tom Cook',
      email: 'tom.cook@example.com',
      role: 'Product Manger',
      pointsBalance: 214,
      enrollmentDate: '2021-06-15',
      logsCount: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },   

  ]

  const [searchTerm, setSearchTerm] = useState('');
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate Total Users
  const totalUsers = people.length;

  // Calculate Average Points
  const averagePoints = people.reduce((acc, person) => acc + person.pointsBalance, 0) / totalUsers;

  // Calculate Total Logs
  const totalLogs = people.reduce((acc, person) => acc + person.logsCount, 0);


  return (
    <div className="bg-gray-100 h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1">
        <header className="bg-white p-4 flex justify-between">
          <h1 className="text-xl font-bold text-gray-700">Dashboard</h1>
          <Link href="/" className='mr-4 text-gray-500'>Log out</Link>
        </header>
        <main className="p-4">
          <div className="bg-white rounded shadow p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-600">Notice</h2>
            <p className="mt-2 text-gray-500">There are no new announcements at this time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="p-6 bg-white rounded shadow">
              <h2 className="text-lg font-semibold text-gray-600">Users</h2>
              <p className="mt-2 text-gray-500">Total users: {totalUsers}</p>
            </div>
            <div className="p-6 bg-white rounded shadow">
              <h2 className="text-lg font-semibold text-gray-600">Points</h2>
              <p className="mt-2 text-gray-500">Average points: {averagePoints}</p>
            </div>
            <div className="p-6 bg-white rounded shadow">
              <h2 className="text-lg font-semibold text-gray-600">Logs</h2>
              <p className="mt-2 text-gray-500">Total logs: {totalLogs}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <FiSearch className="text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users..."
                className="ml-2 p-1 border rounded"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Link className="bg-blue-500 text-white p-2 rounded mr-2" href="/enroll">
              <FaUserPlus className="h-5 w-5" />
            </Link>
          </div>

          {/* Users */} 
          <div className='bg-white rounded shadow p-4 max-h-[375px] overflow-y-auto'>
            <ul role="list" className="divide-y divide-gray-100">
              {filteredPeople.map((person) => (
                <li key={person.email} className="flex justify-between gap-x-6 py-5 ">
                  <div className="flex min-w-0 gap-x-4">
                    <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src={person.imageUrl} alt="" />
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">{person.name} ({person.role})</p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">{person.email}</p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">Points: {person.pointsBalance}, Logs: {person.logsCount}, Enrolled: {person.enrollmentDate}</p>
                    </div>
                  </div>
                  <div className="shrink-0 sm:flex sm:flex-col sm:items-end">
                    <Link className="mr-4 text-gray-500" href={`/dashboard/${person.id}`}>Edit</Link>
                  </div>
                  
                </li>
              ))}
            </ul>
          </div>
          
          
        </main>
      </div>
    </div>
  );
}
