"use client"

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Forbidden from '../components/Forbidden';
import { data } from 'autoprefixer';
import { DateTime } from 'luxon';
import LogCard from '../components/logs/LogCard';
import Spinner from '../components/Spinner';
import SearchBar from '../components/logs/SearchBar';

interface CustomSession {
	user: {
		email: string;
		id: string;
	};
	role: string;
	userId: string;
	accessToken: string;
}

export interface LogGroup {
	[key: string]: string;
}

export interface Log {
	ACTION: string;
	AMOUNT: string;
	LATENCY: string;
	MESSAGE: string;
	METHOD: string;
	SOURCE_IP: string;
	STATUS: string;
	URI: string;
	USER_AGENT: string;
	level: string;
	msg: string;
	time: string;
}

interface Query {
	results: LogGroup[][];
	status: string;
}

export default function DashboardPage() {
	const { data: session } = useSession();
	const customSession = session as unknown as CustomSession;
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;

	const headers = useMemo(() => {
		return { 'Authorization': `Bearer ${customSession.accessToken}` };
	}, [customSession.accessToken]);

	const [logGroups, setLogGroups] = useState<LogGroup[][]>([]);
	const [loadingLogs, setLoadingLogs] = useState(true);
	const [query, setQuery] = useState('');
	const [search, setSearch] = useState('');
	const [start, setStart] = useState(DateTime.now().minus({ days: 7 }).toFormat('yyyy-MM-dd') as string);
	const [end, setEnd] = useState(DateTime.now().toFormat('yyyy-MM-dd') as string);

	const startQuery = async () => {
		try {
			setLoadingLogs(true);
			const startTime = Math.floor(DateTime.fromFormat(start, 'yyyy-MM-dd').toMillis());
			const endTime = Math.floor(DateTime.fromFormat(end, 'yyyy-MM-dd').toMillis());
			const response = await axios.get(`${apiUrl}/logs/start?service=${"points"}&start=${startTime}&end=${endTime}&query=${search}`,{ headers });
			setQuery(response.data.queryId);
		} catch (err) {
			
		}
	};

	useEffect(() => {
		startQuery();
	}, []);

	useEffect(() => {
		if (query) {
			const retrieveQuery = async () => {
				try {
					const response = await axios.get(`${apiUrl}/logs/retrieve?queryId=${query}`,{ headers });
					return response.data;
				} catch (err) {
					
				}
			}

			const intervalId = setInterval(async () => {
				const query = await retrieveQuery();
				if (query.status === 'Complete') {
					setLogGroups(query.results);
					setLoadingLogs(false);
					clearInterval(intervalId);
				}
			}, 1000);

			return () => clearInterval(intervalId);
		}
	}, [query]);

	if (!session) {
		return <Forbidden />;
	}

	return (
		<div className="bg-gray-100 h-screen flex">
			<Sidebar />
			<div className="flex-1">
				<Header title="Access Control Logs" />
				<main className="p-4">
					<div className="flex justify-between items-center mb-4">
						<div className="flex flex-wrap items-center w-full">
							<SearchBar 
								search={search} 
								setSearch={setSearch}
								start={start}
								setStart={setStart}
								end={end}
								setEnd={setEnd}
								startQuery={startQuery} 
							/>
						</div>
					</div>
					{ loadingLogs ? (
						<div className='flex w-full justify-center'>
							<div className={ `animate-spin rounded-full ${"h-10"} ${"w-10"} border-b border-black` } />
						</div>
					) : (
						<div className='flex flex-col gap-4'>
							{ logGroups.map((logGroup, idx) => {
								return (
									<div className='bg-white rounded shadow p-4 max-h-[500px] overflow-y-auto'>
										<LogCard logGroup={logGroup} key={ `log-card-${idx}` } />
									</div>
								)
							}) }
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
