import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import notification from "antd/es/notification";

interface Request {
    _id: string;
    checkerEmail: string;
    checkerId: string;
    data: JSON;
    endpoint: string;
    makerEmail: string;
    makerId: string;
    status: string;
}

export default function MyRequests({ session }: any) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    const [isEmpty, setIsEmpty] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const header = {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            'X-IDTOKEN': `${session.id_token}`,
        },
    };

    const updateRequest = async (id : string, status: string) => {
        const body = {
            "id": id,
            "status": status,
        }

        axios.put(`${apiUrl}/makerchecker/record`, body, header)
        .then((response) => {
            console.log(response.data);
            fetchRequests();

            if (status === 'approved'){
                notification.success({
                    message: 'Request Approved',
                    description: 'Request has been approved successfully',
                });
            } else if (status === 'cancelled'){
                notification.success({
                    message: 'Request Denied',
                    description: 'Request has been denied successfully',
                });
            }

            window.location.reload();
            
        }).catch((error) => {
            console.log(error);
            notification.error({
                message: 'Request Update Failed',
                description: 'Failed to update request',
            });
        });
    };

    const fetchRequests = async () => {
        // Fetch requests from backend/API here
        axios.get(`${apiUrl}/makerchecker/record/pending-approve`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                'X-IDTOKEN': `${session.id_token}`,
            },
        }).then((response) => {
            console.log(response.data);
            setRequests(response.data);

        }).catch((error) => {
            if (error.response.status === 404) {
                setIsEmpty(true);
            } 
            else {
                notification.error({
                    message: 'Failed to fetch pending makercheckers',
                    description: error.message,
                })
            }
        });


        // setRequests(mockupData);
        setLoading(false);
    };

    return (
        <section className="my-requests w-full">
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
                {!isEmpty && requests.map((request: Request) => (
                <tr key={request._id} className="hover:bg-gray-100 transition duration-150 ease-in-out">
                    <td className="text-gray-500 border px-4 py-3">{request.makerEmail}</td>
                    <td className="text-gray-500 border px-4 py-3">{request.endpoint}</td>
                    <td className={`border px-4 py-3 ${request.status === 'Pending' ? 'text-yellow-500' : 'text-green-500'}`}>{request.status}</td>
                    <td className="border px-4 py-3">
                    {request.status === 'pending' && 
                        <button 
                            onClick={() => updateRequest(request._id, 'cancelled')}
                            className="w-full bg-red-500 text-white px-3 py-1 rounded shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        >
                            Cancel
                        </button>}
                    </td>
                </tr>
                ))}
                
            </tbody>
            </table>
            {isEmpty && (<div className="mt-4 text-center text-gray-500">No requests made yet.</div>)}
        </section>
    );
}