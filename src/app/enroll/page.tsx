"use client"

import Sidebar from '@/app/components/Sidebar';
import { useRouter } from 'next/navigation'; 
import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

export default function CreateAccount() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  const handleSubmit = () => {
    // Handle form submission logic here
  };

  return (
    <div className='bg-gray-100 h-screen flex'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-4">
        <header className="bg-white p-4">
          <FiArrowLeft className="h-7 w-7 text-gray-500 cursor-pointer mb-4" onClick={() => router.back()} />
          <h1 className="text-xl font-bold text-gray-700">Enroll User</h1>
        </header>
        <main className="bg-white p-4 rounded shadow">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-4">
              <label className="block text-gray-700">Profile Picture</label>
              <input type="file" className="mt-2" />
              {profilePic && <img src={profilePic} alt="Profile" className="mt-2 h-32 w-32 object-cover rounded-full" />}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 p-2 w-full border rounded" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 p-2 w-full border rounded" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Role</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 p-2 w-full border rounded" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 p-2 w-full border rounded" />
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
              Create Account
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
