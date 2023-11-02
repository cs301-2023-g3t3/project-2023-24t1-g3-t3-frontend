"use client"

import Confirm from '@/app/components/Confirm';
import Forbidden from '@/app/components/Forbidden';
import Sidebar from '@/app/components/Sidebar';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiImage, FiUser } from 'react-icons/fi';

interface CustomSession {
  user: {
    email: string;
    id: string;
  };
  role: string;
  userId: string;
  accessToken: string;
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



export default function EditAccount({ params }: { params: { slug: string } }) {
  const { data: session } = useSession();
  const customSession = ((session as unknown) as CustomSession);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const headers = {
    'Authorization': `Bearer ${customSession.accessToken}`
  };

  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  // Permissions
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [onConfirmSave, setOnConfirmSave] = useState(false);
  const [onConfirmDelete, setOnConfirmDelete] = useState(false);
  
  // Error
  const [onError, setOnError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  
  useEffect(() => {
    checkPermissions();


    // Retrieve account data to set as default values
    Promise.all([
      axios.get(`${apiUrl}/users/accounts/${params.slug}`, { headers }),

      // axios.get(`${apiUrl}/points/accounts/${params.slug}`, { headers })
    ])
    .then(([usersResponse]) => {
      // Handle success for both requests
      const user = usersResponse.data;
      // const points = pointsResponse.data;
      
      // console.log(points);
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setRole(roleMap[user.role || 0]);
;
    })
    .catch(error => {
      console.error(error);
    });
  }, [customSession]);


  const checkPermissions = () => {
    // Check if user has permission to edit account
    setCanEdit(true); 

    axios.delete(`${apiUrl}/users/accounts/-1`, { headers })
    .then(response => {
      console.log("HEY", response);
      // Handle success
      if (response.status === 200) {
        setCanDelete(true);
      } else {
        setCanDelete(false);
      }
    }).catch(error => {
      // Handle error
      console.error(error);
      if (error.response.data.code === 404) {
        setCanDelete(true);
      }
      
    }
    );
  }

  const handleSave = () => {
    // Handle form submission logic here
    setOnConfirmSave(false);
  };
  
  const handleDelete = () => {
    // Handle form submission logic here
    setOnConfirmDelete(false);
  };

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
        <main className="bg-white p-4 rounded shadow">
        <form>
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 pb-12">
            <FiArrowLeft className="h-5 w-5 text-gray-500 cursor-pointer mb-4" onClick={() => router.back()} />
              <h1 className="text-xl font-semibold leading-7 text-gray-900">Edit Account</h1>
            </div>

            <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Personal Information</h2>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                    First name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                    Last name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="points" className="block text-sm font-medium leading-6 text-gray-900">
                    Points
                  </label>
                  <div className="mt-2">
                    <input
                      id="points"
                      name="points"
                      type="number"
                      className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
                    Role
                  </label>
                  <div className="mt-2">
                    <select
                      id="about"
                      name="about"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      {Object.values(roleMap).map((role) => (
                        <option key={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button 
            type="button" 
            className="text-sm font-semibold leading-6 text-gray-900"
            onClick={() => router.back()}
            >

              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              onClick={(e) => {
                e.preventDefault();
                setOnConfirmDelete(true);
              }}
            >
              Delete Account
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={(e) => {
                e.preventDefault();
                setOnConfirmSave(true);
              }}
            >
              Save Changes
            </button>
            
          </div>
        </form>
        </main>
      </div>

      {onConfirmSave && !canEdit && (
        <Confirm
          title="Insufficient Permission"
          message="You do not have the sufficient permissions to edit the account. Would you like to request for approval?"
          onConfirm={() => handleSave()}
          onCancel={() => setOnConfirmSave(false)}
        />
      )}

      {onConfirmSave && canEdit && (
        <Confirm
          title="Confirm Account Edit"
          message="Are you sure you want to edit this account?"
          onConfirm={() => handleSave()}
          onCancel={() => setOnConfirmSave(false)}
        />
      )}

      {onConfirmDelete && !canDelete && (
        <Confirm
          title="Insufficient Permission"
          message="You do not have the sufficient permissions to delete the account. Would you like to request for approval?"
          onConfirm={() => handleDelete()}
          onCancel={() => setOnConfirmDelete(false)}
        />
      )}

      {onConfirmDelete && canDelete && (
        <Confirm
          title="Confirm Account Deletion"
          message="Are you sure you want to delete this account?"
          onConfirm={() => handleDelete()}
          onCancel={() => setOnConfirmDelete(false)}
        />
      )}

      {
        onError && (
          <Confirm
            title="Error"
            message={errorMessage}
            onConfirm={() => setOnError(false)}
            onCancel={() => setOnError(false)}
          />
        )
      }

    </div>
  );
}



