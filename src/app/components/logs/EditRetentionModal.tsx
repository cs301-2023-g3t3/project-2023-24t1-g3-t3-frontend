'use client';

import { Modal, notification } from "antd";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

interface props {
    open: boolean;
    setOpen: (open: boolean) => void;
    retentionInDays: number;
    setRetentionInDays: (retentionInDays: number) => void;
}

interface CustomSession {
	user: {
		email: string;
		id: string;
	};
	role: string;
	userId: string;
	accessToken: string;
}

const EditRetentionModal = (props: props) => {
    const { data: session } = useSession();
	const customSession = session as unknown as CustomSession;
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;

	const headers = useMemo(() => {
		return { 
            'Authorization': `Bearer ${customSession.accessToken}`
     };
	}, [customSession.accessToken]);

    const [retention, setRetention] = useState(props.retentionInDays);

    useEffect(() => {
        setRetention(props.retentionInDays);
    }, [props.retentionInDays])

    const handleCancel = () => {
        props.setOpen(false);
    };
    
    const updateRetention = async () => {
        try {
            const res = await axios.put(`${apiUrl}/logs/retention?days=${retention}`, {}, { headers });
            props.setRetentionInDays(retention);

            notification.success({
                message: "Success",
                description: "Successfully updated the retention period."
            })

            props.setOpen(false);
        } catch (e: any) {
            if (e.response.status === 403) {
                notification.error({
                    message: "Error",
                    description: "You do not have permission to update the retention period."
                });
            } else {
                notification.error({
                    message: "Error",
                    description: "An error occurred while updating the retention period. Please try again later."
                });
            }
        }
    }

    return (
        <>
            <Modal
                footer={null}
                closable={true}
                onCancel={handleCancel}
                title={null}
                open={props.open}
            >
                <div className="relative flex flex-col items-center justify-center">
                    <div className="w-full p-6 bg-white rounded-md lg:max-w-xl">
                        <form className="flex flex-col gap-4 mt-6">
                            <div>
                                <label
                                    className="block text-sm font-semibold text-gray-800"
                                >
                                    Edit Log Retention in Days
                                </label>
                                <select
                                    className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
                                    value={retention}
                                    onChange={(e) => {
                                        setRetention(parseInt(e.target.value))
                                    }}
                                >
                                    <option value="1">1 day</option>
                                    <option value="3">3 days</option>
                                    <option value="5">5 days</option>
                                    <option value="7">7 days</option>
                                    <option value="14">14 days</option>
                                    <option value="30">30 days</option>
                                    <option value="60">60 days</option>
                                    <option value="90">90 days</option>
                                    <option value="120">120 days</option>
                                    <option value="150">150 days</option>
                                    <option value="180">180 days</option>
                                    <option value="365">365 days</option>
                                    <option value="400">400 days</option>
                                    <option value="545">545 days</option>
                                    <option value="731">731 days</option>
                                    <option value="1096">1096 days</option>
                                    <option value="1827">1827 days</option>
                                    <option value="2192">2192 days</option>
                                    <option value="2557">2557 days</option>
                                    <option value="2922">2922 days</option>
                                    <option value="3288">3288 days</option>
                                    <option value="3653">3653 days</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    
                    <div className="relative flex items-center justify-center w-full mt-4 mb-3">
                        <button 
                            className="absolute px-5 px-3 py-2 bg-blue-950 text-white rounded-md transition hover:bg-indigo-900"
                            onClick={() => updateRetention()}
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default EditRetentionModal;
