import { useEffect, useState } from "react";

interface Request {
    id: number;
    user: string;
    request: string;
    status: string;
}

export default function MyRequests() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        // Fetch requests from backend/API here
        // For now, using a mockup static data
        const mockupData: Request[] = [
            { id: 1, user: 'John', request: 'Request to create an account', status: 'Pending' },
            { id: 2, user: 'Jane', request: 'Request to delete an account', status: 'Approved' },
            // ... more data
        ];

        setRequests(mockupData);
        setLoading(false);
    };

    return (
        <section className="my-requests w-1/2">
            <h2 className="text-2xl font-semibold mb-6">Requests Made</h2>
            <table className="min-w-full">
            {/* Table headers and rows */}
            <thead>
                <tr>
                <th className="border-b px-4 py-3 font-medium">User</th>
                <th className="border-b px-4 py-3 font-medium">Request</th>
                <th className="border-b px-4 py-3 font-medium">Status</th>
                <th className="border-b px-4 py-3 font-medium">Actions</th>
                </tr>
            </thead>
            <tbody>
                {requests.map((request: Request) => (
                <tr key={request.id} className="hover:bg-gray-100 transition duration-150 ease-in-out">
                    <td className="text-gray-500 border px-4 py-3">{request.user}</td>
                    <td className="text-gray-500 border px-4 py-3">{request.request}</td>
                    <td className={`border px-4 py-3 ${request.status === 'Pending' ? 'text-yellow-500' : 'text-green-500'}`}>{request.status}</td>
                    <td className="border px-4 py-3">
                    {request.status === 'Pending' && <button className="w-full bg-red-500 text-white px-3 py-1 rounded shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">Cancel</button>}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </section>
    );
}