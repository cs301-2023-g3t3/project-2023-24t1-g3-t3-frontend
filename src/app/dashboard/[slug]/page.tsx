"use client"

import Sidebar from '@/app/components/Sidebar';
import { useRouter } from 'next/navigation'; // Corrected import
import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

export default function EditAccount() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
          <h1 className="text-xl font-bold text-gray-700">Edit Account</h1>
        </header>
        <main className="bg-white p-4 rounded shadow">
          <form onSubmit={handleSubmit} className="flex">
            <div className="w-1/3 ml-4">
                <img className="h-32 w-32 mb-4 flex-none rounded-full bg-gray-50" src='https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' alt="" />
                <label className="block text-gray-700">Profile Picture</label>
                <input type="file" className="mt-2" />
                {profilePic && <img src={profilePic} alt="Profile" className="mt-2 h-32 w-32 object-cover rounded-full" />}
            </div>
            <div className="w-2/3 pl-8">
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 p-2 w-full border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 p-2 w-full border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input type="password" className="mt-2 p-2 w-full border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Confirm Password</label>
                <input type="password" className="mt-2 p-2 w-full border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Role</label>
                <select className="mt-2 p-2 w-full border rounded">
                    <option>Owner</option>
                    <option>Manager</option>
                    <option>Engineer</option>
                    <option>Product Manager</option>
                    <option>None</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Points</label>
                <input type="number" className="mt-2 p-2 w-full border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Status</label>
                <select className="mt-2 p-2 w-full border rounded">
                    <option>Active</option>
                    <option>Inactive</option>
                </select>
              </div> 
              <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Save Changes
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}



