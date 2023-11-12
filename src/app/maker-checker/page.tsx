"use client"

import { FaUserPlus } from 'react-icons/fa';
import { FiEdit, FiFilePlus, FiSearch, FiUserPlus } from 'react-icons/fi';
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
  id_token: string;
}

interface Permission {
    _id: string;
    checker: number[];
    endpoint: string;
    maker: number[];
}

interface Role {
    id: number;
    name: string;
}

interface AccessPoint {
    endpoint: string;
    id: number;
    name: string;
}

export default function MakerChecker() {
    const router = useRouter();
    const { data: session } = useSession();
    const customSession = ((session as unknown) as CustomSession);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermission, setSelectedPermission] = useState<Permission>();
    const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]); // [Permission]

    const [createPermissionModal, setCreatePermissionModal] = useState(false);
    const [createPermission, setCreatePermission] = useState<Permission>({
        _id: '',
        checker: [],
        endpoint: '',
        maker: [],
    } as Permission);


    const headers = { 
        'Authorization': `Bearer ${customSession.accessToken}`, 
        'X-IDTOKEN': `${customSession.id_token}` 
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [accessPoints, setAccessPoints] = useState<AccessPoint[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);


    useEffect(() => {
        Promise.all([
            axios.get(`${apiUrl}/makerchecker/permission`, { headers }),
            axios.get(`${apiUrl}/users/roles`, { headers }),
            axios.get(`${apiUrl}/users/access-points`, { headers })

        ]).then((responses) => {
            const permissions = responses[0].data;
            setPermissions(permissions);
            setFilteredPermissions(permissions);
            console.log(permissions);

            const roles = responses[1].data;
            setRoles(roles);

            const accessPoints = responses[2].data;
            setAccessPoints(accessPoints);

        }).catch((error) => {
            console.log(error);
        });

    }, []);
    
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredPermissions(permissions);
        } else {
            const filteredPermissions = permissions.filter((permission) => {
                return permission.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredPermissions(filteredPermissions);
        }
    }, [searchTerm]);

    useEffect(() => {
        console.log(createPermission);
    }, [createPermission]);

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
          <Header title="Maker Checker" />
          
          <main className="p-4">
            
            <div className="flex flex-col bg-white rounded p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <FiSearch className="text-gray-600 mr-2" />
                        <input type="text" 
                        value={searchTerm}
                        placeholder="Search" className="border border-gray-300 rounded p-2" 
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}/>
                    </div>
                    <button 
                        className="flex items-center"
                        onClick={() => {
                            setCreatePermissionModal(true);
                        }}
                    >
                        <p className="text-gray-600 mr-2">Add Maker Checker</p>
                        <FiFilePlus className="text-gray-600 mr-2" />
                    </button>
                </div>

                {/* Endpoints */}
                <div className="flex flex-col">
                    {filteredPermissions.map((permission) => (
                        <div key={permission._id + permission.endpoint} className="flex flex-col">
                            <div className="flex justify-between items-center mb-4 px-4">
                                <h2 className="text-gray-600 text-lg p-4">{permission.endpoint}</h2>
                                <button className="flex items-center" onClick={() => setSelectedPermission(permission)}>
                                    <p className="text-gray-600">Edit</p>
                                    <FiEdit className="text-gray-600 ml-2" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {selectedPermission && 
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Edit Endpoint
                                        </h3>
        
                                        <h4 className="text-sm leading-6 font-medium text-gray-900 mt-4">
                                            {selectedPermission.endpoint}
                                        </h4>
        

                                        <h4 className="text-sm leading-6 font-medium text-gray-900 mt-4">
                                            Checker
                                        </h4>

                                        <div className="mt-2">
                                            {/* check boxes */}
                                            {roles.map((role) => (
                                                <div key={role.id+"checker"} className="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        name={role.name} 
                                                        value={role.name} 
                                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                                                        checked={selectedPermission.checker.includes(role.id)}
                                                        onChange={() => {
                                                            const newPermission = {...selectedPermission};
                                                            if (newPermission.checker.includes(role.id)) {
                                                                newPermission.checker = newPermission.checker.filter((id) => id !== role.id);
                                                            } else {
                                                                newPermission.checker.push(role.id);
                                                            }
                                                            setSelectedPermission(newPermission);
                                                        }}
                                                    />
                                                    <label className="ml-3 block text-sm font-small text-gray-500">
                                                        {role.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                        <h4 className="text-sm leading-6 font-medium text-gray-900 mt-4">
                                            Maker
                                        </h4>
        
                                        <div className="mt-2">
                                            {/* check boxes */}
                                            {roles.map((role) => (
                                                <div key={role.id+"maker"} className="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        name={role.name} 
                                                        value={role.name} 
                                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                                                        checked={selectedPermission.maker.includes(role.id)}
                                                        onChange={() => {
                                                            const newPermission = {...selectedPermission};
                                                            if (newPermission.maker.includes(role.id)) {
                                                                newPermission.maker = newPermission.maker.filter((id) => id !== role.id);
                                                            } else {
                                                                newPermission.maker.push(role.id);
                                                            }
                                                            setSelectedPermission(newPermission);
                                                        }}
                                                    />
                                                    <label className="ml-3 block text-sm font-small text-gray-500">
                                                        {role.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
        
                                    </div>
                                </div>
                            </div>
        
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button 
                                    type="button" 
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => {
                                        axios.put(`${apiUrl}/makerchecker/permission/${selectedPermission._id}`, 
                                        {
                                            "endpoint" : selectedPermission.endpoint,
                                            "checker" : selectedPermission.checker,
                                            "maker" : selectedPermission.maker
                                        }, { headers }, )
                                        .then((response) => {
                                            console.log(response.data);
                                            setSelectedPermission(undefined);
                                            
                                        }).catch((error) => {
                                            console.log(error);
                                        });
                                    
                                    }}
                                >
                                    Save
                                </button>

                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => {
                                        axios.delete(`${apiUrl}/makerchecker/permission/${selectedPermission._id}`, { headers })
                                        .then((response) => {
                                            console.log(response.data);
                                            setSelectedPermission(undefined);
                                            axios.get(`${apiUrl}/makerchecker/permission`, { headers })
                                            .then((response) => {
                                                setPermissions(response.data);
                                                setFilteredPermissions(response.data);
                                                setSearchTerm('');
                                            }).catch((error) => {console.log(error);});
                                        }).catch((error) => {console.log(error);});
                                    }}
                                >
                                    Delete
                                </button>
                            
                                <button 
                                    onClick={() => {
                                        setSelectedPermission(undefined);
                                        axios.get(`${apiUrl}/makerchecker/permission`, { headers })
                                        .then((response) => {
                                            setPermissions(response.data);
                                            setFilteredPermissions(response.data);
                                            setSearchTerm('');
                                        }).catch((error) => {console.log(error);});
                                        // window.location.reload();

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
                }
                {createPermissionModal &&
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Add Endpoint
                                        </h3>
    
                                        <div className="mt-2">
                                            <select
                                                id="endpoint"
                                                name="endpoint"
                                                className="mt-2 pl-2 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-500 rounded-md h-8"
                                                onChange={(e) => {
                                                    setCreatePermission((prevPermission) => {
                                                        return {
                                                            ...prevPermission,
                                                            endpoint: e.target.value,
                                                        } as Permission;
                                                    });
                                                }}
                                            >
                                                <option value="">Select Endpoint</option>
                                                {accessPoints && accessPoints.map((accessPoint) => (
                                                    <option key={accessPoint.id} value={accessPoint.endpoint}>{accessPoint.name}</option>
                                                ))}

                                            </select>
                                        </div>

                                        <h4 className="text-sm leading-6 font-medium text-gray-900 mt-4">
                                            Checker
                                        </h4>

                                        <div className="mt-2">
                                            {/* check boxes */}
                                            {roles.map((role) => (
                                                <div key={role.id+"checker"} className="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        name={role.name} 
                                                        value={role.name} 
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            const roleId = role.id;
                                                            
                                                            if (isChecked) {
                                                                createPermission.checker.push(roleId);
                                                            } else {
                                                                createPermission.checker.filter((id) => id !== roleId);
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                                                    />
                                                    <label className="ml-3 block text-sm font-small text-gray-500">
                                                        {role.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                        <h4 className="text-sm leading-6 font-medium text-gray-900 mt-4">
                                            Maker
                                        </h4>

                                        <div className="mt-2">
                                            {/* check boxes */}
                                            {roles.map((role) => (
                                                <div key={role.id+"maker"} className="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        name={role.name} 
                                                        value={role.name} 
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            const roleId = role.id;
                                                            
                                                            if (isChecked) {
                                                                createPermission.maker.push(roleId);
                                                            } else {
                                                                createPermission.maker.filter((id) => id !== roleId);
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                                                    />
                                                    <label className="ml-3 block text-sm font-small text-gray-500">
                                                        {role.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                        
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button 
                                    type="button" 
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => {
                                        axios.post(`${apiUrl}/makerchecker/permission`, 
                                        {
                                            "endpoint" : createPermission.endpoint,
                                            "checker" : createPermission.checker,
                                            "maker" : createPermission.maker
                                        }, { headers }, )
                                        .then((response) => {
                                            console.log(response.data);
                                            setCreatePermissionModal(false);
                                            window.location.reload();
                                            
                                        }).catch((error) => {
                                            console.log(error);
                                        });
                                    }}
                                >
                                    Create
                                </button>
                            
                                <button 
                                    onClick={() => {
                                        setCreatePermissionModal(false);
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
                }

            </div>
          </main>
        </div>
      </div>
    );
}