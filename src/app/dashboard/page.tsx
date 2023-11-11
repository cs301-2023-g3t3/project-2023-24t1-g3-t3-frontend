"use client"

import { FaUserPlus } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Image from 'next/image';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import MyRequests from '../components/MyRequests';
import ApproveRequests from '../components/ApproveRequests';
import { signOut, useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Login from '../components/Login';
import Forbidden from '../components/Forbidden';
import Header from '../components/Header';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { sign } from 'crypto';

interface CustomSession {
  user: {
    email: string;
    id: string;
  };
  role: string;
  userId: string;
  accessToken: string;
  id_token: string;
}

interface Request {
  id: number;
  user: string;
  request: string;
  status: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  pointsBalance: number;
}


interface RoleMap {
  [key: number]: string;
}

const roleMap: RoleMap = {
  0: 'Customer',
  1: 'Owner',
  2: 'Manager',
  3: 'Engineer',
  4: 'Product Manager'
};

export default function DashboardPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { data: session } = useSession();
  const customSession = ((session as unknown) as CustomSession);
  
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);

  const [people, setPeople] = useState<User[]>([]);
  const [userSearchOutput, setUserSearchOutput] = useState<User[]>([]); // Filtered by search term
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Calculate Total Users
  const totalUsers = people.length || 0;

  // // Calculate Average Points
  const averagePoints = Math.round(people.reduce((acc, person) => acc + (person.pointsBalance || 0), 0) / (people.length || 1));
  const maxPoints = Math.max(...people.map(person => person.pointsBalance || 0));
  const minPoints = Math.min(...people.map(person => person.pointsBalance || 0));

  // Calculate number per role
  const numberOfOwners = people.filter(person => person.role === 'Owner').length;
  const numberOfManagers = people.filter(person => person.role === 'Manager').length;
  const numberOfEngineers = people.filter(person => person.role === 'Engineer').length;
  const numberOfProductManagers = people.filter(person => person.role === 'Product Manager').length;
  const numberOfCustomers = people.filter(person => person.role === 'Customer').length;

  useEffect(() => {
    if (customSession) {
      console.log(customSession.accessToken)
      console.log(customSession.id_token);
      const decoded = jwt.decode(customSession.accessToken) as jwt.JwtPayload;
      if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
        signOut({callbackUrl: '/'});
        return; // Exit if the token is expired
      }
      
      const headers = {
        'Authorization': `Bearer ${customSession.accessToken}`,
        'X-IDTOKEN': `${customSession.id_token}`
      };

      Promise.all([
        axios.get(`${apiUrl}/users/accounts/paginate?page=1&size=10`, { headers }),
        axios.get(`${apiUrl}/points/accounts/paginate?page=1&size=10`, { headers })
      ])
      .then(([usersResponse, pointsResponse]) => {
        console.log(usersResponse);
        console.log(pointsResponse);
        // Handle users

        // const mappedUsers = users.map((user: { role: number | null; }) => ({
        //   ...user,
        //   role: roleMap[user.role !== null ? user.role : 0],
        //   pointsBalance: 0

        // }));
  
        // Handle points
        // const mappedPoints = pointsResponse.data;
        // const newPeople = mappedUsers.map((person: { id: number; pointsBalance: any; }) => {


        //   const pointsUser = mappedPoints.find((user: { userId: number; }) => user.userId === person.id);
        //   if (!pointsUser) {
        //     return person;
        //   }
          
        //   person.pointsBalance = pointsUser.balance;
        //   return person;
        // });
  
        // Update state
        // setPeople(newPeople);
        // setUserSearchOutput(newPeople);
        // setLoadingUsers(false);
      })
      .catch(error => {
        console.error(error);
        // Handle errors for both requests
        setError(error);
        setLoadingUsers(false);
      });
    }
  }, [customSession, apiUrl]);
  
  // Filter users by search term
  useEffect(() => {
    const filteredPeople = people.filter(person =>
      (person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.pointsBalance.toString().includes(searchTerm.toLowerCase()) ||
      person.id.toString().includes(searchTerm.toLowerCase())
      ) 
    ).filter(person => {
      if (selectedRole === '') {
        return true;
      } else {
        return person.role === selectedRole;
      }
    });
    
    const sortedPeople = filteredPeople.sort((a, b) => {
      if (sortBy === "Lowest") {
        return a.pointsBalance - b.pointsBalance;
      } else if (sortBy === "Highest") {
        return b.pointsBalance - a.pointsBalance;
      } else {
        return 0;
      }
    });
    setUserSearchOutput(sortedPeople);
  }, [searchTerm, selectedRole, sortBy, people]);


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
      <div className="flex-1 overflow-y-auto">
        <Header title="Dashboard" />
        <main className="p-4">
          <div className="bg-white rounded shadow p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-600">Notice</h2>
            <p className="mt-2 text-gray-500">There are no new announcements at this time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="p-6 bg-white rounded shadow">
              <h2 className="text-lg font-semibold text-gray-600">Users</h2>
              {loadingUsers ? <p className="mt-2 text-gray-500">Loading...</p> : <p className="mt-2 text-gray-500">
                Total users: {totalUsers}
                <br />
                Owners: {numberOfOwners}
                <br />
                Managers: {numberOfManagers}
                <br />
                Engineers: {numberOfEngineers}
                <br />
                Product Managers: {numberOfProductManagers}
                <br />
                Customers: {numberOfCustomers}
                </p>}
              {error && <p className="mt-2 text-gray-500">Error: {error}</p>}
              
            </div>
            <div className="p-6 bg-white rounded shadow">
              <h2 className="text-lg font-semibold text-gray-600">Points</h2>
              {loadingUsers ? <p className="mt-2 text-gray-500">Loading...</p> : <p className="mt-2 text-gray-500">
                Max points: {maxPoints}
                <br />
                Average points: {averagePoints}
                <br />
                Min points: {minPoints}
                </p>}
              {error && <p className="mt-2 text-gray-500">Error: {error}</p>}
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <div className='flex items-center'>
                <FiSearch className="text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="ml-2 p-1 border rounded"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                <option value="">Role</option>
                <option value="Owner">Owner</option>
                <option value="Manager">Manager</option>
                <option value="Engineer">Engineer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Customer">Customer</option>
              </select>

              {/* Sort by points */}
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option>Sort by points</option>
                <option value="Highest">Highest</option>
                <option value="Lowest">Lowest</option>
              </select>
            </div>
            
            <Link className="bg-blue-500 text-white p-2 rounded mr-2" href="/enroll">
              <FaUserPlus className="h-5 w-5" />
            </Link>
          </div>

          {/* Users */} 
          <div className='bg-white rounded shadow p-4 max-h-[375px] overflow-y-auto'>
            <ul role="list" className="divide-y divide-gray-100">
              {loadingUsers && <p>Fetching users...</p>}
              {userSearchOutput.map((user) => (
                <li key={user.email} className="flex justify-between gap-x-6 py-5 ">
                  <div className="flex min-w-0 gap-x-4">
                    <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src="/images/profile.jpg" alt="" />
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">{user.firstName} ({user.role})</p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">{user.email}</p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">Points: {user.pointsBalance} </p>
                      <p className='mt-1 text-xs leading-5 text-gray-500'>User ID: {user.id}</p>
                    </div>
                  </div>
                  <div className="shrink-0 sm:flex sm:flex-col sm:items-end">
                    <Link className="mr-4 text-gray-500" href={`/dashboard/${user.id}`}>Edit</Link>
                  </div>
                  
                </li>
              ))}
            </ul>
          </div>
          
          
          {/* <div className="flex lg:flex-row md:flex-col justify-between bg-white rounded-lg shadow-lg p-6 gap-4 text-gray-700 mt-4">
            <MyRequests session={session} />
            <ApproveRequests session={session} />
          </div> */}
          <>
            <style>
              {`
                @media (min-width: 1365px) {
                  .responsive-flex {
                    display: flex;
                    flex-direction: row !important;
                  }
                }
              `}
            </style>
            <div className="flex flex-col lg:flex-row justify-between bg-white rounded-lg shadow-lg p-6 gap-4 text-gray-700 mt-4 responsive-flex">
              <MyRequests session={session} />
              <ApproveRequests session={session} />
            </div>
          </>


          
        </main>
      </div>
    </div>
  );
}
