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
import { useRouter } from 'next/navigation';

interface CustomSession {
  user: {
    email: string;
    id: string;
  };
  role: string;
  userId: string;
  accessToken: string;
}

interface Role {
  id: number;
  name: string;
}

interface RoleMapping {
  roleId: number;
  apId: number;
}

interface AccessPoint {
  id: number;
  name: string;
  endpoint: string;
}

interface RolePermissions {
  [role: string]: { [permission: string]: boolean };
}

export default function AccessControl() {
  const router = useRouter();
  const { data: session } = useSession();
  const customSession = ((session as unknown) as CustomSession);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;


  const headers = {
    'Authorization': `Bearer ${customSession.accessToken}`
  };
  
  const [selectedRole, setSelectedRole] = useState(customSession.role);

  const [roles, setRoles] = useState<Role[]>([]);

  const [originalRolePermissions, setOriginalRolePermissions] = useState<RolePermissions>({});
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({});

  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    Promise.all([
      axios.get(apiUrl + '/users/roles', { headers }),
      axios.get(apiUrl + '/users/role-access', { headers }),
      axios.get(apiUrl + '/users/access-points', { headers })
    ]).then((responses) => {
      const roles = responses[0].data;
      setRoles(roles);
      const roleToAccessPointMapping = responses[1].data;    
      const accessPoints = responses[2].data;
      // console.log(roleToAccessPointMapping);
      // Step 1: Map Access Point IDs to Permission Names
      const accessPointToPermission: {[key: number]: string} = {};
      accessPoints.forEach((ap: AccessPoint) => {
        accessPointToPermission[ap.id] = ap.name;
      });

      // console.log(accessPointToPermission);

      

      // Step 2: For each role, they will have all the access points, but
      // if it exists in roleToAccessPointMapping, then it is checked.
      const roleToAccessPoints: { [key: number]: { [id: number]: boolean } } = {};

      roles.forEach((role: Role) => {
        roleToAccessPoints[role.id] = {};
        accessPoints.forEach((ap: AccessPoint) => {
          roleToAccessPoints[role.id][ap.id] = false;
        });

        roleToAccessPointMapping.forEach((mapping: RoleMapping) => {
          if (mapping.roleId === role.id) {
            roleToAccessPoints[role.id][mapping.apId] = true;
          }
        });
      });


      // Step 3: For each endpoint in roleToAccessPoints, resolve the permission name
      const roleToPermissions: { [role: string]: { [permission: string]: boolean } } = {};
      roles.forEach((role: Role) => {
        roleToPermissions[role.name] = {};
        Object.keys(roleToAccessPoints[role.id]).forEach((apId: string) => {
          if (roleToAccessPoints[role.id][parseInt(apId)]) {
            roleToPermissions[role.name][accessPointToPermission[parseInt(apId)]] = true;
          } else {
            roleToPermissions[role.name][accessPointToPermission[parseInt(apId)]] = false;
          }
        });
      });

      
      setRolePermissions(roleToPermissions);
      setOriginalRolePermissions(roleToPermissions);
      setLoading(false);
    });
  }, []);
  
  const [changes, setChanges] = useState<RolePermissions>({});

  useEffect(() => {
    console.log('Updated changes:', changes);
  }, [changes]);

  const handleCheckboxChange = (role: string, permission: string, isChecked: boolean) => {
    // Copy the current changes
    const newChanges = { ...changes };
  
    // Determine if the new value is different from the original value
    const isValueChanged = originalRolePermissions[role][permission] !== isChecked;
  
    if (isValueChanged) {
      // If the value has changed, update the changes
      if (newChanges[role] === undefined) {
        newChanges[role] = {};
      }
      newChanges[role][permission] = isChecked;
    } else {
      // If the value is toggled back, remove it from the changes
      if (newChanges[role] && newChanges[role][permission] !== undefined) {
        delete newChanges[role][permission];
        // If there are no more changes for this role, delete the role key as well
        if (Object.keys(newChanges[role]).length === 0) {
          delete newChanges[role];
        }
      }
    }
  
    setChanges(newChanges);
  
    // Update rolePermissions (you may or may not need to do this,
    // depending on whether you want to reflect immediate state changes in UI)
    const newRolePermissions = { ...rolePermissions };
    newRolePermissions[role][permission] = isChecked;
    setRolePermissions(newRolePermissions);
  };

  const handleSaveChanges = () => {
    // Send changes to the server
    console.log('Sending changes to the server:', changes);

    // axios.post(apiUrl + '/users/role-access', changes, { headers });

  }
  
  
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
                    {roles && roles.map((role) => (
                        <li className="mb-2" key={role.id+role.name}>
                            <button 
                                onClick={() => setSelectedRole(role.name)} 
                                className={`p-3 w-full rounded hover:text-gray-800 ${selectedRole === role.name ? 'bg-blue-500 text-white' : ''}`}>
                                {role.name}
                            </button>
                        </li>
                    ))}
                </ul>

                </div>

                <div className="flex pl-4 flex-grow flex-col">
                  <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">{selectedRole}</h1>
                    <input
                      type="text"
                      placeholder="Search permission..."
                      className="ml-2 p-1 border rounded"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="overflow-auto max-h-96"> 
                      <table className="min-w-full table-auto">
                          <thead>
                              <tr>
                                  <th className="px-4 py-2 text-left">Permission</th>
                                  <th className="px-4 py-2 text-left">Allow Access</th>
                                  <th className="px-4 py-2 text-left">Require Authorization</th>
                              </tr>
                          </thead>
                          <tbody>
                              {loading ? (
                                  <tr>
                                      <td colSpan={3} className="text-center">Loading...</td>
                                  </tr>
                              ) : (
                                  Object.entries(rolePermissions[selectedRole])
                                  .filter(([permission, _]) => permission.toLowerCase().includes(searchTerm.toLowerCase()))
                                  .map(([permission, isChecked]) => (
                                    <tr key={selectedRole + permission}>
                                      <td className="px-4 py-2">{permission}</td>
                                      <td className="px-4 py-2">
                                        <input 
                                          type="checkbox" 
                                          checked={isChecked} 
                                          onChange={(e) => handleCheckboxChange(selectedRole, permission, e.target.checked)}
                                        />
                                      </td>
                                      <td className="px-4 py-2">
                                        <input 
                                          type="checkbox" 
                                          // Logic for second checkbox if needed
                                        />
                                      </td>
                                    </tr>
                                  ))

                              )}

                          </tbody>
                      </table>
                  </div>

              </div>

              </div>

              <div className="mt-6 flex items-center justify-end gap-x-6">
                <button 
                type="button" 
                className="text-sm font-semibold leading-6 text-gray-900"
                onClick={(e) => {
                  router.push('/');
                }}
                >

                  Cancel Changes
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={(e) => {handleSaveChanges()}}
                >
                  Save Changes
                </button>
                
              </div>
            </div>

            
          </main>
        </div>
      </div>
    );
}