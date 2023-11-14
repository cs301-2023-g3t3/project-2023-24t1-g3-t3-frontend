"use client"

import { FaUserPlus } from 'react-icons/fa';
import { FiFolderPlus, FiSearch, FiTrash } from 'react-icons/fi';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Forbidden from '../components/Forbidden';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';
import { access } from 'fs';
import { notification } from 'antd';
import { update } from 'react-spring';

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
    'Authorization': `Bearer ${customSession.accessToken}`,
    'X-IDTOKEN': `${customSession.id_token}`
  };
  
  const [selectedRole, setSelectedRole] = useState(customSession.role);

  const [roles, setRoles] = useState<Role[]>([]);

  const [originalRolePermissions, setOriginalRolePermissions] = useState<RolePermissions>({});
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({});
  const [accessPoints, setAccessPoints] = useState<AccessPoint[]>([]);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const [newRole, setNewRole] = useState<Role>({} as Role);
  const [updateCount, setUpdateCount] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    Promise.all([
      axios.get(apiUrl + '/users/roles', { headers }),
      axios.get(apiUrl + '/users/role-access', { headers }),
      axios.get(apiUrl + '/users/access-points', { headers }),
    ]).then((responses) => {
      const roles = responses[0].data;
      setRoles(roles);
      const roleToAccessPointMapping = responses[1].data;
      // console.log(roleToAccessPointMapping);
      const accessPoints = responses[2].data;
      setAccessPoints(accessPoints);
      
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
  }, [updateCount]);
  
  const [changes, setChanges] = useState<RolePermissions>({});

  const [createAccessPointModal, setCreateAccessPointModal] = useState<boolean>(false);
  const [deleteAccessPointModal, setDeleteAccessPointModal] = useState<boolean>(false);
  const [createRoleModal, setCreateRoleModal] = useState<boolean>(false);

  const [toDeleteAccessPoint, setToDeleteAccessPoint] = useState<number>(0);

  const [newAccessPoint, setNewAccessPoint] = useState<AccessPoint>({} as AccessPoint);

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
    try {
      Object.keys(changes).forEach((role: string) => {
        console.log("For role:", role);
        const roleId = roles.find((r: Role) => r.name === role)?.id;
        if (roleId) {
          const permissionNames = Object.keys(changes[role]);
          // get id from permission name
          permissionNames.forEach((permissionName: string) => {
            console.log("For permission:", permissionName);
            const apId = accessPoints.find((ap: AccessPoint) => ap.name === permissionName)?.id;
            console.log("apId:", apId);

            if (changes[role][permissionName]) {
              console.log("Call create endpoint");
              axios.post(apiUrl + '/users/role-access', { roleId, apId }, { headers })
              .then((response) => {
                console.log(response)
                })
                .catch((error) => {
                  console.log(error);
                }
              );
            } else {
              console.log("Call delete endpoint");
              axios.delete(apiUrl + '/users/role-access', { data: { roleId, apId }, headers })
              .then((response) => {
                console.log(response)
                })
                .catch((error) => {
                  console.log(error);
                }
              );
            }
            // window.location.reload();
          });
        }
        
      });

      setSavedSuccess(true);
      notification.success({
        message: 'Changes saved successfully!',
        description: 'Changes saved successfully!',
      });

    } catch (error) {
      console.log(error);
    } finally {
      // window.location.reload();
    }
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
                    <button
                      className='p-3 w-full rounded hover:text-gray-800 bg-gray-500 text-white'
                      onClick={() => {
                        setCreateRoleModal(true);
                      }}
                      >
                        Create Role
                      </button>
                </ul>

                </div>

                <div className="flex pl-4 flex-grow flex-col">
                  <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">{selectedRole}</h1>
                    <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Search permission..."
                      className="ml-2 p-1 border rounded"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button 
                      className="flex gap-2 text-gray-700 hover:text-gray-800"
                      onClick={() => setCreateAccessPointModal(true)}
                    >
                      <FiFolderPlus className="text-2xl text-gray-900 cursor-pointer hover:text-gray-800" />
                    </button>
                    </div>
                    
                  </div>
                  <div className="overflow-auto max-h-96"> 
                      <table className="min-w-full table-auto">
                          <thead>
                              <tr>
                                  <th className="px-4 py-2 text-left">Permission</th>
                                  <th className="px-4 py-2 text-left">Allow Access</th>
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
                                      <td className="flex px-4 py-2 items-center justify-between">
                                        <input 
                                          type="checkbox" 
                                          checked={isChecked} 
                                          onChange={(e) => handleCheckboxChange(selectedRole, permission, e.target.checked)}
                                        />
                                        <button 
                                          onClick={() => {
                                            const id = accessPoints.find((ap: AccessPoint) => ap.name === permission)?.id;
                                            setToDeleteAccessPoint(id as number);
                                            setDeleteAccessPointModal(true);
                                          }}
                                        >
                                          <FiTrash className="text-red-500 text-xl cursor-pointer hover:text-red-600" />
                                        </button>
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
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={(e) => {handleSaveChanges()}}
                >
                  Save Changes
                </button>
                
              </div>

              {/* {savedSuccess && (
                  <div className="flex w-full mt-6 flex items-center justify-end gap-x-6">
                      <p className="text-green-600 font-semibold">Changes saved successfully!</p>
                      <svg className="h-6 w-6 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                      </svg>
                      
                  </div>
              )} */}

              {createAccessPointModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                  <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                              <div className="sm:flex sm:items-start">
                                  <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                      Create Access Point
                                      </h3>

                                      <div className="mt-2">
                                          <input 
                                              type="text" 
                                              name="accesspoint" 
                                              id="accesspoint" 
                                              className="pl-2 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-500 rounded-md h-8" 
                                              placeholder="Name of Action"
                                              onChange={(e) => {
                                                newAccessPoint.name = e.target.value;
                                              }}
                                          />
                                      </div>

                                      <div className="mt-2">
                                          <input 
                                              type="text" 
                                              name="accesspoint" 
                                              id="accesspoint" 
                                              className="pl-2 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-500 rounded-md h-8" 
                                              placeholder="Access point (e.g. /*/PUT/points/accounts/*)"
                                              onChange={(e) => {
                                                  newAccessPoint.endpoint = e.target.value;
                                              }}
                                          />
                                      </div>
                                      
                                  </div>
                              </div>
                          </div>
                          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                              <button 
                                  type="button" 
                                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                  onClick={() => {
                                      axios.post(apiUrl + '/users/access-points', 
                                      {
                                          name: newAccessPoint.name,
                                          endpoint: newAccessPoint.endpoint
                                      }, { headers }).then((response) => {
                                          console.log(response);
                                          setCreateAccessPointModal(false);
                                          notification.success({
                                            message: 'Access point created successfully!',
                                            description: 'Access point created successfully!',
                                          });
                                          setUpdateCount(updateCount + 1);
                                          // window.location.reload();
                                      }).catch((error) => {
                                          console.log(error);
                                          notification.error({
                                            message: 'Error creating access point!',
                                            description: 'Error creating access point!',
                                          });
                                      }
                                      );
                                  }}
                              >
                                  Create
                              </button>
                          
                              <button 
                                  onClick={() => {
                                      setCreateAccessPointModal(false);
                                  }}
                                  type="button" 
                                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                              >
                                  Cancel
                              </button>
                          </div>
                      </div>
                  </div>
              </div>

              )}

              {deleteAccessPointModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                  <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                              <div className="sm:flex sm:items-start">
                                  <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                      Delete Access Point
                                      </h3>

                                      <div className="mt-2">
                                          <p className="text-sm text-gray-500">Are you sure you want to delete this access point?</p>
                                      </div>
                                      
                                  </div>
                              </div>
                          </div>
                          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                              <button 
                                  type="button" 
                                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                  onClick={() => {
                                      axios.delete(apiUrl + `/users/access-points/${toDeleteAccessPoint}`, { headers })
                                      .then((response) => {
                                          console.log(response);
                                          setDeleteAccessPointModal(false);
                                          notification.success({
                                            message: 'Access point deleted successfully!',
                                            description: 'Access point deleted successfully!',
                                          });
                                          setUpdateCount(updateCount + 1);
                                          // window.location.reload();
                                      }).catch((error) => {
                                          console.log(error);
                                      });
                                  }}
                              >
                                  Delete
                              </button>

                              <button 
                                  onClick={() => {
                                      setDeleteAccessPointModal(false);
                                  }}
                                  type="button" 
                                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                              >
                                  Cancel
                              </button>
                            </div>
                        </div>
                    </div>
                  </div>

              )}

              {createRoleModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                  <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                              <div className="sm:flex sm:items-start">
                                  <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                      Create Role
                                      </h3>

                                      <div className="mt-2">
                                          <input 
                                              type="text" 
                                              name="newRole" 
                                              id="newRole" 
                                              className="pl-2 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-500 rounded-md h-8" 
                                              placeholder="Name of Role"
                                              onChange={(e) => {
                                                newRole.name = e.target.value;
                                              }}
                                          />
                                      </div>
                                      
                                  </div>
                              </div>
                          </div>
                          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse flex-col">
                              <button 
                                  type="button" 
                                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                  onClick={() => {
                                      axios.post(apiUrl + '/users/roles', 
                                      {
                                          "name": newRole.name,
                                      }, { headers }).then((response) => {
                                          console.log(response);
                                          setCreateRoleModal(false);
                                          notification.success({
                                            message: 'Role created successfully!',
                                            description: 'Role created successfully!',
                                          });
                                          setUpdateCount(updateCount + 1);
                                          
                                      }).catch((error) => {
                                          console.log(error);
                                          notification.error({
                                            message: 'Error creating role!',
                                            description: 'Error creating role!',
                                          });
                                      }
                                      );
                                  }}
                              >
                                  Create
                              </button>
                          
                              <button 
                                  onClick={() => {
                                      setCreateRoleModal(false);
                                  }}
                                  type="button" 
                                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                              >
                                  Cancel
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
                
                )
                    
              }

            </div>

            
          </main>
        </div>
      </div>
    );
}