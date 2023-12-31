import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMoreHorizontal } from 'react-icons/fi';

interface CustomSession {
    user: {
        email: string;
        id: string;
    };
    role: string;
}

export default function Sidebar() {
    const { data: session } = useSession();
    const customSession = ((session as unknown) as CustomSession);
    console.log(customSession.role);
    const email = session?.user?.email?.split('@')[0];
    // Assuming role will be present at runtime.
    const role = ((session as unknown) as CustomSession)?.role || "Role not found";
    const image = session?.user?.image || '/images/default-profile.png';
    const name = session?.user?.name || email;

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
                    {["Owner", "Manager", "Engineer"].includes(customSession.role) && (
                        <li className="mb-2">
                            <a href="/logs" className="text-gray-600 hover:text-gray-800">Logs</a>
                        </li>
                    )}
                    

                    {customSession.role === "Owner" && (
                        <li className="mb-2">
                            <a href="/access-control" className="text-gray-600 hover:text-gray-800">Access Control</a>
                        </li>
                    )}
                    
                    {customSession.role === "Owner" && (
                        <li className="mb-2">
                            <a href="/maker-checker" className="text-gray-600 hover:text-gray-800">Maker Checker</a>
                        </li>
                    )}
                </ul>
                <div className='flex flex-col justify-end flex-grow'>
                    <div className='flex justify-between items-center'>
                        <Image 
                            src={image} 
                            alt="Profile Picture"
                            width={50}
                            height={50}
                            className='rounded-full'
                        />
                        <div className='flex w-3/4 items-center'>
                            <div className='flex flex-col'>
                                <h1 className='ml-4 text-l leading-6 text-gray-900'>{name}</h1>
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