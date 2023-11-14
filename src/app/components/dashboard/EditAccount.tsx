"use client"

import Sidebar from '@/app/components/Sidebar';
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import Confirm from '../Confirm';
import { useSession } from 'next-auth/react';
import Forbidden from '../Forbidden';
import axios from 'axios';
import notification from 'antd/es/notification';
import { Form } from 'antd';

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

interface Account {
	firstName: string;
	lastName: string;
	email: string;
	role: string;
}

interface Role {
	id: number;
	name: string;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

interface props {
	user: User;
	roleMap: { [ key: number ]: string }
}

const Spinner = () => {
	return (
		<div className="fixed z-10 inset-0 -top-48" aria-labelledby="modal-title" role="dialog" aria-modal="true">
			<div className="flex items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
				<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
				<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
				<div className="inline-block align-bottom rounded-lg text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
					<div className='flex w-full justify-center'>
						<div className={ `animate-spin rounded-full ${"h-10"} ${"w-10"} border-b border-black` } />
					</div>
				</div>
			</div>
		</div>
	
	);
}
	
export default function EditAccount({ user, roleMap }: props) {
	const { data: session } = useSession();
	const customSession = ((session as unknown) as CustomSession);
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	
	const headers = {
		'Authorization': `Bearer ${customSession.accessToken}`,
		'X-IDTOKEN': `${customSession.id_token}`,
	};
	
	const [firstName, setFirstName] = useState(user.firstName);
	const [lastName, setLastName] = useState(user.lastName);
	const [email, setEmail] = useState(user.email);

	const roleEntry = Object.entries(roleMap).find(([id, name]) => name === user.role)
	const [role, setRole] = useState(
		roleEntry ? roleEntry[0] : 0
	);

	const [type, setType] = useState("");

	const [confirmModal, setConfirmModal] = useState(false);
	const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
	const [requestPermissionModal, setRequestPermissionModal] = useState(false);
	const [loading, setLoading] = useState(false);
	
	const [makerChecker, setMakerChecker] = useState(false);
	const [checkerId, setCheckerId] = useState("");
	const [checkers, setCheckers] = useState<any[]>([]);

	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

	const handleEditAccount = async () => {
		setConfirmModal(false);
		setLoading(true);
		
		const account = {
			firstName,
			lastName,
			email,
			...(role !== 0 && { role: role })
		};
		
		console.log(account);
		axios.put(`${apiUrl}/users/accounts/${user.id}`, account, { headers })
		.then((res) => {
			console.log(res);
			setLoading(false);
			setConfirmModal(false);
			window.location.reload();

			
		}).catch((err) => {
			console.log(err);
			setLoading(false);
			if (err.response.status === 403) {
			verifyIfCanMakerCheckerEdit();
			} else {
				notification.error({
					message: 'Error',
					description: 'Failed to edit account.',
				});
			}
			// setRequestPermissionModal(true);
		});
	}

	const handleDeleteAccount = async () => {
		setConfirmDeleteModal(false);
		setLoading(true);
		
		axios.delete(`${apiUrl}/users/accounts/${user.id}`, { headers })
		.then((res) => {
			console.log(res);
			setLoading(false);
			setConfirmDeleteModal(false);
			window.location.reload();

			
		}).catch((err) => {
			console.log(err);
			setLoading(false);
			if (err.response.status === 403) {
				verifyIfCanMakerCheckerDelete();
			} else {
				notification.error({
					message: 'Error',
					description: 'Failed to delete account.',
				});
			}
			// setRequestPermissionModal(true);
		});
	}

	const createMakerCheckerRecord = async () => {
		setLoading(true);

		const endpoint = type == "edit" ? `/*/PUT/users/accounts/*` : `/*/DELETE/users/accounts/*`;

		const data = {
			id: user.id,
			firstName,
			lastName,
			email,
			...(role !== 0 && { role: role })
		};

		const request = {
			checkerId,
			endpoint,
			data
		};

		axios.post(`${apiUrl}/makerchecker/record`, request, { headers })
		.then((res) => {
			console.log(res);
			setRequestPermissionModal(false);
			notification.success({
				message: 'Success',
				description: 'Request sent.',
			});
			setLoading(false);

			window.location.reload();
		}).catch((err) => {
			console.log(err);
		});
	}

	const verifyIfCanMakerCheckerEdit = async () => {
		setLoading(true);
		const endpoint = `/*/PUT/users/accounts/*`;

		const request = {
			endpoint,
		};

		axios.post(`${apiUrl}/makerchecker/verify`, request, { headers })
		.then((res) => {
			console.log(res);
			setCheckers(res.data);
			setRequestPermissionModal(false);
			setMakerChecker(true);
			setLoading(false);
		}).catch((err) => {
			console.log(err);
			if (err.response.status === 403) {
				notification.error({
					message: 'Error',
					description: 'Not allowed to edit account.',
				});
				
			} else if (err.response.status === 404) {
				notification.error({
					message: 'Error',
					description: 'Account not found.',
				});
			} else if (err.response.status === 400) {
				notification.error({
					message: 'Error',
					description: 'Bad request.',
				});
			}

			setLoading(false);
		});
	}

	const verifyIfCanMakerCheckerDelete = async () => {
		setLoading(true);
		const endpoint = `/*/DELETE/users/accounts/*`;

		const request = {
			endpoint,
		};

		axios.post(`${apiUrl}/makerchecker/verify`, request, { headers })
		.then((res) => {
			console.log(res);
			setCheckers(res.data);
			setRequestPermissionModal(false);
			setMakerChecker(true);
			setLoading(false);
		}).catch((err) => {
			console.log(err);
			if (err.response.status === 404) {
				notification.error({
					message: 'Error',
					description: 'Not allowed to delete account.',
				});
			} else {
				notification.error({
					message: 'Error',
					description: 'Unable to delete account.',
				});
			}
			setLoading(false);
		});
	}

	useEffect(() => {
		console.log(role);
	}, [role]);

	// useEffect(() => {
	// }, []);
	
	if (!session) {
		return (
			<Forbidden />
		);
	}


	return (
		<>
			{/* Main content */}
			<div className="flex-1 p-4">
				{requestPermissionModal && (
					<Confirm
						title="Insufficient Permission"
						message="You do not have the sufficient permissions to edit/delete the account. Would you like to request for approval?"
						onConfirm={() => verifyIfCanMakerCheckerEdit()}
						onCancel={() => setRequestPermissionModal(false)}
					/>
				)}

				{confirmModal && (
					<Confirm
						title="Confirm Account Edit"
						message="Are you sure you want to edit this account?"
						onConfirm={() => {handleEditAccount()}}
						onCancel={() => setConfirmModal(false)}
					/>
				)}

				{confirmDeleteModal && (
					<Confirm
						title="Confirm Account Deletion"
						message="Are you sure you want to delete this account?"
						onConfirm={() => {handleDeleteAccount()}}
						onCancel={() => setConfirmDeleteModal(false)}
					/>
				)}

				{
					loading && (
							<Spinner />
					)
				}

				{makerChecker && (
					<div className="fixed z-10 inset-0 -top-48" aria-labelledby="modal-title" role="dialog" aria-modal="true">
						<div className="flex items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
							<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
							<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
							<div className="inline-block align-bottom rounded-lg text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
								<div className='p-4 bg-white'>
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-lg leading-6 font-medium text-gray-900">Request a checker</h3>
										<button
											className="bg-white rounded-full p-2 hover:bg-gray-100"
											onClick={() => setMakerChecker(false)}
										>
											<svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none"
													viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
															d="M6 18L18 6M6 6l12 12"/>
											</svg>
										</button>
									</div>
									<form className="flex flex-col">
											
											<div className="mb-4">
												<label className="block text-gray-700">Select a checker</label>
												<select 
													value={checkerId}
													onChange={(e) => setCheckerId(e.target.value)}
													className="mt-2 p-2 w-full border rounded">
													{checkers && checkers.map((checker) => (
														<option key={checker.id} value={checker.id}>{checker.firstName} -- {roleMap[checker.role]}</option>
													))}
												</select>
											</div>
												<button
													className="bg-blue-500 text-white p-2 rounded"
													onClick={(e) => {
														e.preventDefault();
														createMakerCheckerRecord();
														setMakerChecker(false);
													}}
												>
													Request
												</button>

											</form>
								</div>
							</div>
						</div>
					</div>
				)}
				
				<main className="p-4">
					<form className="flex flex-col">
						<div className="mb-4">
							<label className="block text-gray-700">First Name</label>
							<input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-2 p-2 w-full border rounded" />
						</div>
						<div className="mb-4">
							<label className="block text-gray-700">Last Name</label>
							<input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-2 p-2 w-full border rounded" />
						</div>
						<div className="mb-4">
							<label className="block text-gray-700">Email</label>
							<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 p-2 w-full border rounded" />
						</div>
						<div className="mb-4">
							<label className="block text-gray-700">Role</label>
							<select 
								value={role}
								onChange={(e) => setRole(parseInt(e.target.value))}
								className="mt-2 p-2 w-full border rounded">
								{roleMap && Object.entries(roleMap).map(([id, name]) => (
									<option key={id} value={id}>{name}</option>
								))}
							</select>
						</div>
					</form>
				</main>
				<div className='flex w-full justify-between'>
					<button
						className="bg-red-500 text-white p-2 rounded"
						onClick={(e) => {
							e.preventDefault();
							setType("delete");
							setConfirmDeleteModal(true);
						}}
					>
						Delete Account
					</button>
					<button
						className="bg-blue-500 text-white p-2 rounded"
						onClick={(e) => {
							e.preventDefault();
							setType("edit");
							setConfirmModal(true);
						}}
					>
						Edit Account
					</button>
				</div>
			</div>
		</>
	);
}
