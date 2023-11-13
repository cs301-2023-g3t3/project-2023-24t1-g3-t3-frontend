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

interface PointsAccount {
    id: string;
    userId: string;
    balance: number;
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
	pointsAccount: PointsAccount;
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
	
export default function EditPointsAccount({ pointsAccount }: props) {
	const { data: session } = useSession();
	const customSession = ((session as unknown) as CustomSession);
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	
	const headers = {
		'Authorization': `Bearer ${customSession.accessToken}`,
		'X-IDTOKEN': `${customSession.id_token}`,
	};
	
    const [roles, setRoles] = useState<Role[]>([
		{ id: 0, name: "Customer" },
		{ id: 1, name: "Owner" },
		{ id: 2, name: "Manager" },
		{ id: 3, name: "Engineer" },
		{ id: 4, name: "Product Manager" },
	]);
	
	const [amount, setAmount] = useState("0");
    const [operation, setOperation] = useState("add");

	const [confirmModal, setConfirmModal] = useState(false);
	const [requestPermissionModal, setRequestPermissionModal] = useState(false);
	const [loading, setLoading] = useState(false);
	
	const [makerChecker, setMakerChecker] = useState(false);
	const [checkerId, setCheckerId] = useState("");
	const [checkers, setCheckers] = useState<any[]>([]);

	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

	const handleEditPointsAccount = async () => {
		setConfirmModal(false);

        if (isNaN(parseInt(amount))) {
            notification.error({
                message: 'Error',
                description: 'Amount must be a number.',
            });

            return;
        }

		setLoading(true);
		
		const account = {
			id: pointsAccount.id,
            action: operation,
            amount: parseInt(amount),
		};
		
		axios.put(`${apiUrl}/points/accounts/${pointsAccount.id}`, account, { headers })
		.then((res) => {
			console.log(res);
			setLoading(false);
			setConfirmModal(false);
			window.location.reload();

			
		}).catch((err) => {
			console.log(err);
			setLoading(false);
			verifyIfCanMakerChecker();
			// setRequestPermissionModal(true);
		});
	}

	const createMakerCheckerRecord = async () => {
		setLoading(true);

		const endpoint = `/*/PUT/points/accounts/*`;

		const data = {
			id: pointsAccount.id,
			action: operation,
			amount: parseInt(amount),
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

	const verifyIfCanMakerChecker = async () => {
		setLoading(true);
		const endpoint = `/*/PUT/points/accounts/*`;

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
					description: 'Not allowed to edit points account.',
				});
				setLoading(false);
			}
		});
	}

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
						message="You do not have the sufficient permissions to edit the points account. Would you like to request for approval?"
						onConfirm={() => verifyIfCanMakerChecker()}
						onCancel={() => setRequestPermissionModal(false)}
					/>
				)}

				{confirmModal && (
					<Confirm
						title="Confirm Points Account Edit"
						message="Are you sure you want to edit this points account?"
						onConfirm={() => {handleEditPointsAccount()}}
						onCancel={() => setConfirmModal(false)}
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
                                                    <option key={checker.id} value={checker.id}>{checker.firstName} -- {roles[checker.role].name}</option>
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
				)

				}
				
				<main className="p-4">
					<form className="flex flex-col">
						<div className="mb-4">
							<label className="block text-gray-700">Balance</label>
                            <select 
                                value={operation}
                                onChange={(e) => setOperation(e.target.value)}
                                className="mt-2 p-2 w-full border rounded"
                            >
                                <option value="add">Add</option>
                                <option value="deduct">Deduct</option>
                                <option value="override">Override</option>
                            </select>
							<input
                                type="text" 
                                className="mt-2 p-2 w-full border rounded"
                                value={amount}
                                onChange={(e) => {
                                    const re = /^[0-9\b]+$/;
                                    if (e.target.value === '' || re.test(e.target.value)) {
                                        setAmount(e.target.value);
                                    }
                                }}
                            />
						</div>
                        <button
                            className="bg-blue-500 text-white p-2 rounded"
                            onClick={(e) => {
                                e.preventDefault();
                                setConfirmModal(true);
                            }}
                        >
                            Edit Points
                        </button>
					</form>
				</main>
			</div>
		</>
	);
}
