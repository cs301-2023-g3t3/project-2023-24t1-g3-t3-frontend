import Image from 'next/image';
import Link from 'next/link';

export default function Sidebar() {
    return (
        <aside className="bg-white w-64 p-4 shadow rounded hidden-mobile">
            <Link href="/dashboard">    
                <Image
                src="/images/smu-logo.jpg"
                alt="School Logo"
                width={250}
                height={250}
                className='mx-auto'
                />
            </Link>
            <ul>
            <li className="mb-2">
                <a href="/dashboard" className="text-gray-600 hover:text-gray-800">Dashboard</a>
            </li>
            <li className="mb-2">
                <a href="logs" className="text-gray-600 hover:text-gray-800">Logs</a>
            </li>
            <li className="mb-2">
                <a href="#" className="text-gray-600 hover:text-gray-800">Settings</a>
            </li>
            </ul>
        </aside>
    );
}