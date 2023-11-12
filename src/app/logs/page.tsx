"use client"

import { use, useEffect, useMemo, useState } from 'react';
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
import EditRetentionModal from '../components/logs/EditRetentionModal';

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
	ACTOR: string;
	AMOUNT?: string;
	LATENCY: string;
	MESSAGE: string;
	METHOD: string;
	SOURCE_IP: string;
	STATUS: string;
	URI: string;
	USER_AGENT: string;
	USER_DETAILS?: {
		id: string;
		role: string
	};
	UPDATED_USER_DETAILS?: {
		id: string;
		role: string
	};
	level: string;
	msg: string;
	time: string;
}

export interface Location {
    company: {
        domain: string;
        name: string;
    },
    location: {
        city: string;
        country: string;
    },
    is_vpn: boolean;
    is_abuser: boolean;
}

export interface Locations {
	[key: string]: Location;
}

interface Query {
	results: LogGroup[][];
	status: string;
}

const PAGE_SIZE = 25;

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
	const [end, setEnd] = useState(DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd') as string);
	const [locations, setLocations] = useState<Locations>({});
	const [page, setPage] = useState(0);
	const [isNewPage, setIsNewPage] = useState(false);
	const [maxPage, setMaxPage] = useState(0);
	const [isDone, setIsDone] = useState(false);

	const [retentionInDays, setRetentionInDays] = useState(0);
	const [retentionModalOpen, setRetentionModalOpen] = useState(false);
	const [loadingRetention, setLoadingRetention] = useState(true);

	useEffect(() => {
		const getRetention = async () => {
			try {
				setLoadingRetention(true);
				const response = await axios.get(`${apiUrl}/logs/retention`, { headers });
				setRetentionInDays(response.data.retentionInDays);
			} catch (err) {
				
			} finally {
				setLoadingRetention(false);
			}
		}

		getRetention();
	}, [])

	const startQuery = async (search: string) => {
		try {
			setLoadingLogs(true);
			setPage(0);
			setIsDone(false);
			const startTime = Math.floor(DateTime.fromFormat(start, 'yyyy-MM-dd').toMillis());
			const endTime = Math.floor(DateTime.fromFormat(end, 'yyyy-MM-dd').toMillis());
			const response = await axios.get(`${apiUrl}/logs/start?service=${"points"}&start=${startTime}&end=${endTime}&query=${search}`,{ headers });
			setQuery(response.data.queryId);
		} catch (err) {
			
		}
	};

	const startNewPagesQuery = async () => {
		try {
			setLoadingLogs(true);
			setIsNewPage(true);
			setPage(maxPage);
			const startTime = Math.floor(DateTime.fromFormat(start, 'yyyy-MM-dd').toMillis());

			const endTime = Math.floor(
				DateTime.fromFormat(logGroups[logGroups.length - 1][0].value, "yyyy-MM-dd HH:mm:ss.SSS", { zone: 'utc' }).toMillis()
			);

			const response = await axios.get(`${apiUrl}/logs/start?service=${"points"}&start=${startTime}&end=${endTime}&query=${search}`,{ headers });
			setQuery(response.data.queryId);
		} catch (err) {
			
		}
	}

	useEffect(() => {
		startQuery(search);
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
					if (isNewPage) {
						if (query.results.length == 0) {
							setPage(page - 1);
							setIsDone(true);
						}

						setIsNewPage(false);
						setLogGroups([...logGroups, ...query.results]);
					} else {
						setLogGroups(query.results);
					}

					setLocationsFromIP(
						query.results.map((logGroup: LogGroup[]) => JSON.parse(logGroup[1].value).SOURCE_IP)
					);
					
					setLoadingLogs(false);
					setQuery('');
					clearInterval(intervalId);
				}
			}, 1000);

			return () => clearInterval(intervalId);
		}
	}, [query]);

	const setLocationsFromIP = async (ips: string[]) => {
		const res = await axios.post<Locations>(
			`https://api.ipapi.is/?key=${atob(atob("TnpFNFlUaG1OekF3TURGaVpHUmxaUT09"))}`,
			{
				ips: ips
			}
		)
		
		setLocations((prev) => ({...prev, ...res.data}));
	}

	useEffect(() => {
		console.log(logGroups.length)
		setMaxPage(Math.ceil(logGroups.length / PAGE_SIZE));
	}, [logGroups]);


	if (!session) {
		return <Forbidden />;
	}

	return (
		<div className="flex">
			<Sidebar />
			<div className="relative bg-gray-100 h-screen w-full overflow-y-scroll">
				<Header title="Access Control Logs" />
				<main className="p-4">
					<EditRetentionModal 
						open={retentionModalOpen}
						setOpen={setRetentionModalOpen}
						retentionInDays={retentionInDays} 
						setRetentionInDays={setRetentionInDays} 
					/>
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
					<div className='flex gap-2 items-center pb-4 text-sm font-semibold'>
						<div>Logs are retained for { loadingRetention ? "-" : retentionInDays} days.</div>
						<button 
							className='bg-gray-300 rounded-md px-4 py-2 hover:bg-gray-400 transition'
							onClick={() => setRetentionModalOpen(true)}
						>
							Edit
						</button>
					</div>
					{ loadingLogs ? (
						<div className='flex w-full justify-center'>
							<div className={ `animate-spin rounded-full ${"h-10"} ${"w-10"} border-b border-black` } />
						</div>
					) : (
						<div className='flex flex-col'>
							<div className='flex flex-col gap-4'>
								{ logGroups.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((logGroup, idx) => {
									const ip = JSON.parse(logGroup[1].value).SOURCE_IP;
									return (
										<div className='bg-white rounded shadow p-4 max-h-[500px]' key={ `log-card-${idx}` }>
											<LogCard 
												logGroup={logGroup} 
												location={locations[ip]} 
												setSearch={setSearch} 
												startQuery={startQuery} 
											/>
										</div>
									)
								}) }
							</div>
							<div className='flex gap-6 justify-center items-center my-20'>
								<button 
									className='text-white text-xs bg-blue-950 px-4 py-2 rounded-md'
									onClick={() => setPage((prev) => Math.max(0, page - 1))}
								>
									Prev
								</button>
								{ logGroups.length > 0 && (
									<div className='flex gap-2'>
										{ Array(maxPage).fill(0).map((_, idx) => {
											return (page == idx) ? (
													<button className='text-white text-xs bg-blue-950 px-4 py-2 rounded-md' key={ `page-button-${idx}` }>{idx + 1}</button>
												) : (
													<button 
														className='text-white text-xs bg-gray-400 px-4 py-2 rounded-md'
														key={ `page-button-${idx}` }
														onClick={() => setPage(idx)}
													>
														{idx + 1}
													</button>
											)
										}) }

										{ logGroups.length % PAGE_SIZE == 0 && !isDone && (
											<button 
												className='text-white text-xs bg-gray-400 px-4 py-2 rounded-md'
												onClick={startNewPagesQuery}
											>
												...
											</button>
										)}
									</div>
								)}
								<button 
									className='text-white text-xs bg-blue-950 px-4 py-2 rounded-md'
									onClick={() => setPage((prev) => Math.min(maxPage - 1, prev + 1))}
								>
									Next
								</button>
							</div>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
