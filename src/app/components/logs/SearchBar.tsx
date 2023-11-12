import { FaSearch } from "react-icons/fa";

interface props {
	search: string;
	setSearch: (search: string) => void;
	start: string;
	setStart: (start: string) => void;
	end: string;
	setEnd: (end: string) => void;
	startQuery: (search: string) => void;
}

const SearchBar = (props: props) => {
	return (
		<div className="flex w-full items-center justify-center">
			<div className="relative mt-2 rounded-md shadow-sm w-6/12">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
					<FaSearch />
				</div>
				<input
					type="text"
					value={props.search}
					onChange={(e) => props.setSearch(e.target.value)}
					className="flex items-center block w-full rounded-md border-0 py-3 pl-12 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					placeholder="Search..."
				/>
			</div>
			<div className="relative mt-2 rounded-md shadow-sm w-2/12">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
					Start:
				</div>
				<input
					type="date"
					value={props.start}
					onChange={(e) => props.setStart(e.target.value)}
					className="flex items-center block w-full rounded-md border-0 py-3 pl-20 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				/>
			</div>
			<div className="relative mt-2 rounded-md shadow-sm w-2/12">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
					End:
				</div>
				<input
					type="date"
					value={props.end}
					onChange={(e) => props.setEnd(e.target.value)}
					className="flex items-center block w-full rounded-md border-0 py-3 pl-20 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
				/>
			</div>
			<div 
				className="flex items-center justify-center cursor-pointer w-2/12 bg-blue-950 rounded-md py-3 mt-2 text-white text-sm"
				onClick={() => props.startQuery(props.search)}
			>
				Search
			</div>
		</div>
	)
}

export default SearchBar;