import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMoreHorizontal } from 'react-icons/fi';

export default function Sidebar() {
    const { data: session } = useSession();


    const user = session?.user?.name;
    const imageUrl = session?.user?.image || '/images/default-profile.png';
    const role = "Manager"
    
    return (
        <aside className="flex flex-col bg-white w-64 p-4 shadow rounded hidden-mobile">
            <Link href="/dashboard">    
                <Image
                src="/images/smu-logo.jpg"
                alt="School Logo"
                width={250}
                height={250}
                className='mx-auto'
                />
            </Link>
            
            <div className='flex flex-col h-full align-end'>
                <ul>
                    <li className="mb-2">
                        <a href="/dashboard" className="text-gray-600 hover:text-gray-800">Dashboard</a>
                    </li>
                    <li className="mb-2">
                        <a href="/logs" className="text-gray-600 hover:text-gray-800">Logs</a>
                    </li>
                    <li className="mb-2">
                        <a href="/settings" className="text-gray-600 hover:text-gray-800">Settings</a>
                    </li>
                </ul>
                <div className='flex flex-col justify-end flex-grow'>
                    <div className='flex justify-between items-center'>
                        <div className='flex items-center'>
                            <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src={imageUrl} alt="" />
                            
                            <div className='flex flex-col'>
                                <h1 className='ml-4 text-l leading-6 text-gray-900'>{user}</h1>
                                <h2 className='ml-4 text-sm leading-6 text-gray-500'>{role}</h2>
                            </div>
                        </div>
                        <FiMoreHorizontal className='h-5 w-5 text-gray-500 cursor-pointer' />
                    </div>
                </div>

            </div>
            
            
        </aside>
    );
}