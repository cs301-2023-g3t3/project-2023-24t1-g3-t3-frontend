"use client"

import { FaUserPlus } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Forbidden from '../components/Forbidden';
import Header from '../components/Header';

export default function Settings() {
  const { data: session } = useSession();
  const [selectedRole, setSelectedRole] = useState('Engineer');

  const roles = [
    'Engineer',
    'Product Manager',
    'Manager',
    'Owner',
  ];
  
  const rolePermissions: {[key: string]: string[]} = {
    'Owner': [],
    'Manager': ['Update User Details'],
    'Product Manager': ['Update User Details', 'Update Points'],
    'Engineer': ['Create User', 'Update User Details', 'Delete User', 'Update Points'],
  };
  

  
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
        <div className="flex-1 overflow-y-auto h-screen">
          <Header title="Access Control" />
          
          <main className="p-4">
            <div className="flex flex-col bg-white rounded p-4">
              <div className="flex flex-col mb-4">
                <h1 className="text-2xl font-semibold text-gray-900">Access Control</h1>
                <p className="text-gray-700">Manage user roles and permissions.</p>
              </div>

              <div className="flex">
                <div className="flex w-1/8 h-full border rounded flex-col mb-4">
                <ul>
                    {roles.map((role) => (
                        <li className="mb-2" key={role}>
                            <button 
                                onClick={() => setSelectedRole(role)} 
                                className={`p-3 w-full rounded hover:text-gray-800 ${selectedRole === role ? 'bg-blue-500 text-white' : ''}`}>
                                {role}
                            </button>
                        </li>
                    ))}
                </ul>

                </div>

                <div className="flex pl-4 flex-grow flex-col">
                  <h1 className="text-2xl font-semibold text-gray-900">{selectedRole}</h1>
                  <table className="min-w-full table-auto">
                      <thead>
                          <tr>
                              <th className="px-4 py-2 text-left">Permission</th>
                              <th className="px-4 py-2 text-left">Allow Access</th>
                              <th className="px-4 py-2 text-left">Require Authorization</th>
                          </tr>
                      </thead>
                      <tbody>
                          {rolePermissions[selectedRole].map((permission) => (
                              <tr key={selectedRole + permission}>
                                  <td className="px-4 py-2">{permission}</td>
                                  <td className="px-4 py-2">
                                      <input type="checkbox" />
                                  </td>
                                  <td className="px-4 py-2">
                                      <input type="checkbox" />
                                  </td>
                              </tr>
                          ))}
                      </tbody>

                  </table>
                </div>
              </div>

              
              <button className="w-1/12 bg-blue-500 text-white px-3 py-1 rounded shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Save</button>
              
            </div>

            
          </main>
        </div>
      </div>
    );
}