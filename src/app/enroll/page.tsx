"use client"

import Sidebar from '@/app/components/Sidebar';
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import Confirm from '../components/Confirm';
import { useSession } from 'next-auth/react';
import Forbidden from '../components/Forbidden';


  
export default function CreateAccount() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [profilePic, setProfilePic] = useState(null);

  // Permissions
  const [canCreate, setCanCreate] = useState(false);
  const [onConfirm, setOnConfirm] = useState(false);


  const checkPermissions = () => {
    // Check if user has permission to create account
    setCanCreate(false); 
  }

  const handleSubmit = () => {
    // Handle form submission logic here
    setOnConfirm(false);
  };

  useEffect(() => {
    checkPermissions();
  });
  
  if (!session) {
    return (
      <Forbidden />
    );
  }


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
          <form className="flex flex-col">
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
              <select className="mt-2 p-2 w-full border rounded">
                <option>Owner</option>
                <option>Manager</option>
                <option>Engineer</option>
                <option>Product Manager</option>
                <option>None</option>
              </select>
            </div>
            { !autoGenerate && (
              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="mt-2 p-2 w-full border rounded" 
                />
              </div>
            )}
              <div className="mb-4">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  checked={autoGenerate}
                  onChange={(e) => setAutoGenerate(e.target.checked)}
                />
                <label className="text-gray-700">Let the system auto-generate password</label>
              </div>

              <button
                className="bg-blue-500 text-white p-2 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  setOnConfirm(true);
                }}
              >
                Create Account
              </button>

            </form>
        </main>
      </div>

      {onConfirm && !canCreate && (
        <Confirm
          title="Insufficient Permission"
          message="You do not have the sufficient permissions to create the account. Would you like to request for approval?"
          onConfirm={() => handleSubmit()}
          onCancel={() => setOnConfirm(false)}
        />
      )}

      {onConfirm && canCreate && (
        
        <Confirm
          title="Confirm Account Creation"
          message="Are you sure you want to create this account?"
          onConfirm={() => handleSubmit()}
          onCancel={() => setOnConfirm(false)}
        />
      )}

    </div>
  );
}
