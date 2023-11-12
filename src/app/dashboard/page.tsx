"use client"

import { FaUserPlus } from 'react-icons/fa';
import { FiArrowDown, FiChevronDown, FiSearch } from 'react-icons/fi';
import Image from 'next/image';
import { use, useEffect, useRef, useState } from 'react';
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
import User from '../components/dashboard/UserRow';
import UserRow from '../components/dashboard/UserRow';
import React from 'react';
import debounce from 'lodash.debounce';
import CreateAccount from '../components/dashboard/CreateAccount';
import EditAccount from '../components/dashboard/EditAccount';

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
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
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

	const headers = {
		'Authorization': `Bearer ${customSession.accessToken}`,
		'X-IDTOKEN': `${customSession.id_token}`
	};

	headers['Authorization'] = `Bearer eyJraWQiOiJwZ1ROMVpGZGlLdndiWEpRMnBXemE5MHY5WFd6eENxQTdlamNhejRtVlF3PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4MTQ1MGUzOC01NjY0LTRjYjItYjQzMi1hMTAyNDIwYWRmNmEiLCJjb2duaXRvOmdyb3VwcyI6WyIxIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aGVhc3QtMV9QT3pUazM2UDAiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI3MTFydmd0bTRmYjU5bWJib29vdHVnMTJnaiIsIm9yaWdpbl9qdGkiOiJkN2UyM2JiMC1iNmEwLTQ3NDQtOTExNS0wNTM0Y2NiNWQzY2IiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNjk5NjcwNzQwLCJleHAiOjE2OTk3NTcxNDAsImlhdCI6MTY5OTY3MDc0MCwianRpIjoiN2RjMDFlZTktMjFmNC00MDI1LThhNDAtZmM5ODJmODIwZGFkIiwidXNlcm5hbWUiOiJnb29nbGVfMTA3Njk4OTMwMzE1Mzk1MTkzNzg0In0.TlSHqWSooJl0TX03py6ez_FzQuHQS4PsndPnvipM5Yv4qqDognKu5sSTH4Hqb7S91qstHTGaPJmhradDqxcETMcwCkX6z_zEaQVGdbGCMq55mDUm6us9VjjfW6lysaQrA7GrBuM_gUq9wKjk_D_lVWrcYSRC_U9iqavgyOoUDykZY8hLDzmCadkYvvf-N-aE9dRLqK95TElJvvIto4S-tqIBhWQh5ei98kj2mgva0ltPDPQjO7Jz38Xwhl2zP0mXGCeGqOUbrwMdsTjj4SXjzoeJpSDsZssx--sfNczgb5sgDpC1ExOtCOsnLUZAiCMIP9G0dQ7SLBL7qFm63tVMhQ`;

	const [loadingUsers, setLoadingUsers] = useState(true);
	const [error, setError] = useState(null);

	const [people, setPeople] = useState<User[]>([]);
	const [userSearchOutput, setUserSearchOutput] = useState<User[]>([]); // Filtered by search term

	const [selectedRole, setSelectedRole] = useState('');
	const [searchName, setSearchName] = useState('');
	const [searchId, setSearchId] = useState('');
	const [searchEmail, setSearchEmail] = useState('');

	const [pageCount, setPageCount] = useState(1);
	const [loadingMorePeople, setLoadingMorePeople] = useState(false);
	const scrollableDivRef = useRef<HTMLDivElement>(null);

	const [enrollUser, setEnrollUser] = useState(false);
	const [currentEditUser, setCurrentEditUser] = useState<User>();

	const getRoleIdFromRoleName = (roleName: string) => {
		const roleId = Object.values(roleMap).findIndex(role => role === roleName);

		if (roleId === -1) {
			return "null";
		}
		return roleId;
	}

	const loadMorePeople = () => {
		if (loadingMorePeople) {
			return;
		}

		setLoadingMorePeople(true);
		setLoadingUsers(true);
		
		console.log("sending GET to /users/accounts/paginate?page=" + pageCount + "&size=50")
		axios.get(`${apiUrl}/users/accounts/paginate?page=${pageCount}&size=50`, { headers })
		.then(response => {
			const users = response.data.data;
			
			// map role id to role name
			const mappedUsers = users.map((user: { role: number | null; }) => ({
				...user,
				role: roleMap[user.role !== null ? user.role : 0],
				pointsBalance: 0

			}));
			setPeople([...people, ...mappedUsers]);
			console.log("set output at 118")
			setUserSearchOutput([...userSearchOutput, ...mappedUsers]);
			setLoadingUsers(false);
		}).catch(error => {
			console.error(error);
			// Handle errors for both requests
			setError(error);
			setLoadingUsers(false);
		});

		setLoadingMorePeople(false);
	}

	const handleScroll = () => {
		if (!scrollableDivRef.current) {
			return;
		}
		const { scrollTop, scrollHeight, clientHeight } = scrollableDivRef.current;
		if (scrollTop + clientHeight === scrollHeight) {
			setPageCount(prev => prev + 1);
		}
	}

	useEffect(() => {
		const div = scrollableDivRef.current;
		if (div) {
			div.addEventListener('scroll', handleScroll);
		}
		return () => {
			if (div) {
				div.removeEventListener('scroll', handleScroll);
			}
		}

	}, []);

	useEffect(() => {
		if (searchName === '' && searchEmail === '' && searchId === '' && selectedRole === '') {
		loadMorePeople();
		console.log(pageCount);
		}
	}, [pageCount]);

	useEffect(() => {
		if (customSession) {
			console.log(customSession.accessToken)
			console.log(customSession.id_token);
			const decoded = jwt.decode(customSession.accessToken) as jwt.JwtPayload;
			if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
				signOut({callbackUrl: '/'});
				return; // Exit if the token is expired
			}

			// Get users
			axios.get(`${apiUrl}/users/accounts/paginate?page=1&size=50`, { headers })
				.then(response => {
					const users = response.data.data;
					// map role id to role name
					const mappedUsers = users.map((user: { role: number | null; }) => ({
						...user,
						role: roleMap[user.role !== null ? user.role : 0],
						pointsBalance: 0

					}));
					setPeople(mappedUsers);
					console.log("set output at 182")
					setUserSearchOutput(mappedUsers);
					setLoadingUsers(false);
				})
				.catch(error => {
					console.error(error);
					// Handle errors for both requests
					setError(error);
					setLoadingUsers(false);
				});
		}
	}, [customSession, apiUrl]);

	const debouncedSearch = React.useCallback(
		debounce(() => {
			fetchUsers();
		}, 300),
		[searchName, searchEmail, searchId, selectedRole]
	);
	
	const fetchUsers = () => {
		const params = new URLSearchParams();
		if (searchName) params.append('name', searchName);
		if (searchEmail) params.append('email', searchEmail);
		if (searchId) params.append('id', searchId);
		if (selectedRole) {
			const roleId = getRoleIdFromRoleName(selectedRole);
			if (roleId) params.append('role', roleId.toString());
		}
		if (params.toString() === '') {
			console.log("set output at 261")
			if (people.length === 0) {
				return;
			}
			setUserSearchOutput(people);
			setLoadingUsers(false); 
			return;
		}
		console.log("Sending GET to /users/accounts?" + params);
		axios.get(`${apiUrl}/users/accounts?${params}`, { headers })
		.then(response => {
			const users = response.data;
			
			// map role id to role name
			const mappedUsers = users.map((user: { role: number | null; }) => ({
				...user,
				role: roleMap[user.role !== null ? user.role : 0],
				pointsBalance: 0

			}));
			console.log("set output at 276")
			setUserSearchOutput(mappedUsers);
			setLoadingUsers(false);
			
		}).catch(error => {
			console.error(error);
			// Handle errors for both requests
			setError(error);
			setLoadingUsers(false);
		});
	}
	
	useEffect(() => {
		setLoadingUsers(true);
		debouncedSearch();
		
		return () => {
			debouncedSearch.cancel();
		};
	}, [debouncedSearch]);
	

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
					
					
					<div className="flex justify-between items-center mb-4">
						<div className="flex flex-col lg:flex-row lg:gap-2 gap-4">
							<div className='flex items-center'>
								<FiSearch className="text-gray-400 h-5 w-5" />
								<input
									type="text"
									placeholder="Search name..."
									className="ml-2 p-1 border rounded"
									value={searchName}
									onChange={e => setSearchName(e.target.value)}
								/>
							</div>

							<div className='flex items-center'>
								<FiSearch className="text-gray-400 h-5 w-5" />
								<input
									type="text"
									placeholder="Search ID..."
									className="ml-2 p-1 border rounded"
									value={searchId}
									onChange={e => setSearchId(e.target.value)}
								/>
							</div>

							<div className='flex items-center'>
								<FiSearch className="text-gray-400 h-5 w-5" />
								<input
									type="text"
									placeholder="Search email..."
									className="ml-2 p-1 border rounded"
									value={searchEmail}
									onChange={e => setSearchEmail(e.target.value)}
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


						</div>
						
						<button 
							className="bg-blue-500 text-white p-2 rounded mr-2" 
							onClick={() => {setEnrollUser(true)}}
						>
							<FaUserPlus className="h-5 w-5" />
						</button>

					</div>

					{/* Users */} 
					<div ref={scrollableDivRef} className='bg-white rounded shadow p-4 max-h-[375px] overflow-y-auto'>
						<ul role="list" className="divide-y divide-gray-100">
							{userSearchOutput.map((user, idx) => (
								<UserRow 
									key={user.id + idx + "userRowParent"}
									user={user}
									setCurrentEditUser={setCurrentEditUser}
								/>
							))}
							{ loadingUsers && (
								<div className='flex w-full justify-center'>
									<div className={ `animate-spin rounded-full ${"h-10"} ${"w-10"} border-b border-black` } />
								</div>
							)}
						</ul>
					</div>
					
					<>
						<div className="flex flex-col justify-between bg-white rounded-lg shadow-lg p-6 gap-4 text-gray-700 mt-4">
							<MyRequests session={session} />
							<ApproveRequests session={session} />
						</div>
					</>
					
				</main>
			</div>

			{/* Enroll User Modal */}
			{enrollUser && (
				<div className="fixed z-10 inset-0 overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div className="fixed inset-0 transition-opacity" aria-hidden="true">
							<div className="absolute inset-0 bg-gray-500 opacity-75"></div>
						</div>

						<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

						<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg leading-6 font-medium text-gray-900">Enroll User</h3>
									<button
										className="bg-white rounded-full p-2 hover:bg-gray-100"
										onClick={() => setEnrollUser(false)}
									>
										<svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none"
												 viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"/>
										</svg>
									</button>
								</div>
								<div>
									<CreateAccount />
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Edit User Modal */}
			{currentEditUser && (
				<div className="fixed z-10 inset-0 overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div className="fixed inset-0 transition-opacity" aria-hidden="true">
							<div className="absolute inset-0 bg-gray-500 opacity-75"></div>
						</div>

						<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

						<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg leading-6 font-medium text-gray-900">Edit User</h3>
									<button
										className="bg-white rounded-full p-2 hover:bg-gray-100"
										onClick={() => setCurrentEditUser(undefined)}
									>
										<svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none"
												 viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"/>
										</svg>
									</button>
								</div>
								<div>
									<EditAccount user={currentEditUser} />
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
