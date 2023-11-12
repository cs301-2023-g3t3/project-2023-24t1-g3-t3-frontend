import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

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

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

interface PointsAccount {
    id: string;
    userId: string;
    balance: number;
}

const Spinner = () => {
    return (
        <div className='flex w-full justify-center'>
            <div className={ `animate-spin rounded-full ${"h-10"} ${"w-10"} border-b border-black` } />
        </div>
    );
}


export default function UserRow(user : User) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const { data: session } = useSession();
    const customSession = ((session as unknown) as CustomSession);

    const headers = {
        'Authorization': `Bearer ${customSession.accessToken}`,
        'X-IDTOKEN': `${customSession.id_token}`
    };

    const [showPointsAccounts, setShowPointsAccounts] = useState(false);
    const [pointsAccounts, setPointsAccounts] = useState<PointsAccount[]>([]);
    const [hasFetchedPointsAccounts, setHasFetchedPointsAccounts] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function fetchPointsAccount() {
        axios.get(`${apiUrl}/points/accounts/user-account/${user.id}`, {
            headers: headers
        }).then((response) => {
            setPointsAccounts(response.data);
            setIsLoading(false);
            setHasFetchedPointsAccounts(true);
        }).catch((error) => {
            setIsLoading(false);
            console.log(error);

        });
        
    }

    return (
        <li className="border-t border-gray-200">
            <div className="flex justify-between gap-x-6 py-5 ">
                <div className="flex min-w-0 gap-x-4">
                <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src="/images/profile.jpg" alt="" />
                <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-gray-900">{user.firstName} ({user.role})</p>
                    <p className="mt-1 truncate text-xs leading-5 text-gray-500">{user.email}</p>
                    <p className='mt-1 text-xs leading-5 text-gray-500'>User ID: {user.id}</p>
                </div>
                </div>
                <div className="flex flex-col shrink-0 sm:flex sm:flex-col sm:items-end">
                <Link className="mr-4 text-gray-500" href={`/dashboard/${user.id}`}>Edit</Link>
                
                {!showPointsAccounts && (
                    <button className='mr-4 mt-4 text-gray-500' onClick={
                        () => {
                            if (!showPointsAccounts){
                                setIsLoading(true);
                                fetchPointsAccount();
                            } 
                                
                            setShowPointsAccounts(!showPointsAccounts);
                        }}
                    >
                        <FiChevronDown className="h-5 w-5" />  
                    </button>
                )}

                {showPointsAccounts && (
                    <button className='mr-4 mt-4 text-gray-500' onClick={
                        () => {
                            setShowPointsAccounts(!showPointsAccounts);
                        }}
                    >
                        <FiChevronUp className="h-5 w-5" />
                    </button>
                )}
                
                </div>
                
            </div>

            {showPointsAccounts && (
                <div className="border-t border-gray-200">
                    {isLoading ? (
                        <Spinner />
                    ): (hasFetchedPointsAccounts ? (pointsAccounts.map((pointsAccount) => (
                        <dl key={pointsAccount.id + "PointsAccount"}>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm leading-5 font-medium text-gray-500">
                                Points Account
                            </dt>
                            <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                                {pointsAccount.id}
                            </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm leading-5 font-medium text-gray-500">
                                Points Balance
                            </dt>
                            <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                                {pointsAccount.balance}
                            </dd>
                            </div>
                        </dl>
                    ))) : (
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm leading-5 font-medium text-gray-500">
                            Points Account
                            </dt>
                            <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                                This user has no Points Account
                            </dd>
                        </div>  
                        )
                        )
                    }
                </div>

            )}
        </li>
    );
}