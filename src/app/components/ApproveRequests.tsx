import { Tooltip } from "antd";
import notification from "antd/es/notification";
import axios from "axios";
import { useEffect, useState } from "react";

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

interface CustomSession {
    session: {
        accessToken: string;
        id_token: string;
    }
}

export default function ApproveRequests({ session }: CustomSession) {
    const header = {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            'X-IDTOKEN': `${session.id_token}`,
        },
    };
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEmpty, setIsEmpty] = useState(false);


    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showDenyModal, setShowDenyModal] = useState(false);

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
            
        }).catch((error) => {
            console.log(error);
            notification.error({
                message: 'Request Update Failed',
                description: 'Failed to update request',
            });
        });
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        // // Fetch requests from backend/API here
        axios.get(`${apiUrl}/makerchecker/record/to-approve`, {
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
            } else {
                setError(error);
            }
            
        });
        setLoading(false);
    };


    return (
        <section className="to-approve-requests w-full">
            <h2 className="text-2xl font-semibold mb-6">Requests to Approve</h2>
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
                {requests.map(request => (
                <tr key={request._id} className="hover:bg-gray-100 transition duration-150 ease-in-out">
                    <td className="text-gray-500 border px-4 py-3">{request.makerEmail}</td>
                    <Tooltip title={JSON.stringify(request.data)}>
                        <td className="text-gray-500 border px-4 py-3 truncate">{request.endpoint}</td>
                    </Tooltip>
                    {/* <td className="text-gray-500 border px-4 py-3">{request.endpoint}</td> */}
                    <td className={`border px-4 py-3 ${request.status === 'Pending' ? 'text-yellow-500' : 'text-green-500'}`}>{request.status}</td>
                    <td className="border px-4 py-3 flex-grow gap-2">
                    {request.status === 'pending' && 
                        <div className="flex justify-between gap-4">
                            <button 
                                className="w-full bg-green-500 text-white px-3 py-1 rounded shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                onClick={() => {updateRequest(request._id, 'approved')}}
                            >
                                Approve
                            </button>
                            <button 
                                className="w-full bg-red-500 text-white px-3 py-1 rounded shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                onClick={() => {updateRequest(request._id, 'cancelled')}}
                            >
                                Deny
                            </button>
                        </div>
                    }
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            {isEmpty && (<div className="mt-4 text-center text-gray-500">No requests to approve</div>)}
            {error && (<div className="mt-4 text-center text-red-500">{error}</div>)}
        </section>
    );
}
