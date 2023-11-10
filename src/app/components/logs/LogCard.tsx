'use client';

import { Log, LogGroup } from "@/app/logs/page";
import { DateTime } from "luxon";
import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";

interface props {
    logGroup: LogGroup[]
}

const LogCard = (props: props) => {
    const [open, setOpen] = useState(false);
    const log = JSON.parse(props.logGroup[1].value) as Log;
    const service = log.URI.split("/")[1].charAt(0).toUpperCase() + log.URI.split("/")[1].slice(1);

    return (
        <div className="flex flex-col">
            <div className="flex w-full justify-between">
                <div className="relative flex gap-2 px-8 py-4 text-xs">
                    <div className="flex gap-1">
                        <div className="text-xxs dark:text-gray-400">
                            Source IP:
                        </div>
                        <div className="col">
                            { log.SOURCE_IP }
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className="flex gap-1">
                            <div className="text-xxs dark:text-gray-400">
                                Date:
                            </div>
                            <div className="flex gap-1">
                                <div>
                                    {
                                        DateTime.fromISO(log.time).toFormat("DD")
                                    }
                                </div>
                                <div>
                                    {
                                        DateTime.fromISO(log.time).toFormat("TT")
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col gap-1 items-end">
                        <div className="flex gap-1">
                            <div className="text-xxs dark:text-gray-400">
                                Service:
                            </div>
                            <div className="flex gap-1">   
                                <div>
                                    { service }
                                </div>
                                <div className="dark:text-gray-400">
                                    ({ log.URI })
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-6 text-xs px-8 py-4">
                    <div className="col gap-1 items-end">
                        <div className="flex gap-1 items-end">
                            <div className="text-xxs dark:text-gray-400">
                                HTTP { log.STATUS }
                            </div>
                        </div>
                    </div>
                    <div 
                        className="flex justify-center items-center right-0 cursor-pointer"
                        onClick={() => setOpen(prev => !prev)}
                    >
                        <FaCaretDown 
                            className="text-base transition transition-[transform] duration-300 ease-in-out" 
                            style={{
                                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="transition-[max-height] transition duration-500 ease-in-out overflow-y-hidden bg-gray-100 rounded-sm" style={{
                maxHeight: open ? "300px" : "0px",
            }}>
                <div className="grid grid-cols-5 w-full gap-2 px-8 py-4 text-xs">
                    <div className="col gap-1">
                        <div className="text-xxs dark:text-gray-400">
                            Action
                        </div>
                        <div className="col">
                            { log.ACTION }
                        </div>
                    </div>
                    <div className="col gap-1">
                        <div className="text-xxs dark:text-gray-400">
                            Message
                        </div>
                        <div className="col">
                            { log.MESSAGE }
                        </div>
                    </div>
                    <div className="col gap-1">
                        <div className="text-xxs dark:text-gray-400">
                            Amount
                        </div>
                        <div className="col">
                            { log.AMOUNT }
                        </div>
                    </div>
                    <div className="col gap-1">
                        <div className="text-xxs dark:text-gray-400">
                            User Agent
                        </div>
                        <div className="col">
                            { log.USER_AGENT }
                        </div>
                    </div>
                    <div className="col gap-1">
                        <div className="text-xxs dark:text-gray-400">
                            Latency
                        </div>
                        <div className="col text-green-600">
                            { log.LATENCY }ms
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LogCard;