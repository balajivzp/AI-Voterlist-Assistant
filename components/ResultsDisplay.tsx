import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { ExtractedData, Voter } from '../types';

interface InfoCardProps {
    title: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}

const ICONS = {
    constituency: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /> </svg>,
    polling: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /> </svg>,
    stats: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> </svg>
};

const InfoCard: React.FC<InfoCardProps> = ({ title, children, icon }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center mb-2">
            {icon}
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="space-y-1 text-sm text-slate-700 pl-8">{children}</div>
    </div>
);

interface InfoItemProps {
    label: string;
    value: string | number;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="font-medium text-slate-600">{label}:</span>
        <span>{value}</span>
    </div>
);

const VoterTable: React.FC<{ voters: Voter[] }> = ({ voters }) => {
    const [inputValue, setInputValue] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Debounce search term to avoid performance issues on large lists
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(inputValue);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue]);

    const filteredVoters = useMemo(() => {
        if (!debouncedSearchTerm) {
            return voters;
        }
        const lowercasedTerm = debouncedSearchTerm.toLowerCase();
        return voters.filter(voter => 
            voter.name.toLowerCase().includes(lowercasedTerm) ||
            voter.voterId.toLowerCase().includes(lowercasedTerm) ||
            voter.serialNumber.toString().includes(debouncedSearchTerm)
        );
    }, [voters, debouncedSearchTerm]);
    
    const ROW_HEIGHT = 49; // Row height in pixels
    const OVERSCAN = 5; // Number of items to render before and after the visible area

    const [containerHeight, setContainerHeight] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const updateHeight = () => setContainerHeight(container.clientHeight);
            updateHeight();
            const resizeObserver = new ResizeObserver(updateHeight);
            resizeObserver.observe(container);
            return () => resizeObserver.disconnect();
        }
    }, []);

    const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
    const endIndex = Math.min(
        filteredVoters.length - 1,
        startIndex + Math.ceil(containerHeight / ROW_HEIGHT)
    );

    const virtualStart = Math.max(0, startIndex - OVERSCAN);
    const virtualEnd = Math.min(filteredVoters.length - 1, endIndex + OVERSCAN);

    const virtualItems = useMemo(() => {
        const items = [];
        for (let i = virtualStart; i <= virtualEnd; i++) {
            if (filteredVoters[i]) {
                items.push({
                    voter: filteredVoters[i],
                    style: {
                        position: 'absolute' as const,
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${ROW_HEIGHT}px`,
                        transform: `translateY(${i * ROW_HEIGHT}px)`,
                    }
                });
            }
        }
        return items;
    }, [filteredVoters, virtualStart, virtualEnd]);
    
    const totalHeight = filteredVoters.length * ROW_HEIGHT;

    const rowClasses = "flex items-center text-sm";
    const cellClasses = "px-4 py-2 whitespace-nowrap truncate";

    return (
        <div className="mt-6">
            <h3 className="text-xl font-bold text-slate-800 mb-3">Voter List</h3>
            <input
                type="text"
                placeholder="Search by name, ID, or S.No..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 mb-4 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Search voters"
            />
            <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-slate-100 font-bold text-slate-600 sticky top-0 z-10 text-xs uppercase tracking-wider">
                    <div className={rowClasses}>
                        <div className={`${cellClasses} w-16`}>S.No</div>
                        <div className={`${cellClasses} flex-1`}>Name</div>
                        <div className={`${cellClasses} flex-[1.5]`}>Relation</div>
                        <div className={`${cellClasses} w-20 hidden md:block`}>Age</div>
                        <div className={`${cellClasses} w-24 hidden md:block`}>Gender</div>
                        <div className={`${cellClasses} flex-1 hidden sm:block`}>Voter ID</div>
                    </div>
                </div>
                <div
                    ref={scrollContainerRef}
                    onScroll={onScroll}
                    className="overflow-y-auto max-h-[calc(50vh-40px)] relative"
                    role="list"
                >
                    {filteredVoters.length > 0 ? (
                        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                            {virtualItems.map(({ voter, style }) => (
                                <div key={voter.voterId || voter.serialNumber} style={style} className="hover:bg-blue-50 even:bg-slate-50/70 transition-colors duration-200 border-b border-slate-200 last:border-b-0" role="listitem">
                                   <div className={`${rowClasses} h-full`}>
                                        <div className={`${cellClasses} w-16 font-medium text-slate-900`}>{voter.serialNumber}</div>
                                        <div className={`${cellClasses} flex-1 text-slate-800`}>{voter.name}</div>
                                        <div className={`${cellClasses} flex-[1.5] text-slate-600`}>
                                            <span className="capitalize text-xs">{voter.relationType}: </span>{voter.relationName}
                                        </div>
                                        <div className={`${cellClasses} w-20 text-slate-600 hidden md:block`}>{voter.age}</div>
                                        <div className={`${cellClasses} w-24 text-slate-600 capitalize hidden md:block`}>{voter.gender}</div>
                                        <div className={`${cellClasses} flex-1 text-slate-500 font-mono hidden sm:block`}>{voter.voterId}</div>
                                   </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-4 text-slate-500">No voters found matching your search.</div>
                    )}
                </div>
            </div>
        </div>
    );
};


const ResultsDisplay: React.FC<{ data: ExtractedData }> = ({ data }) => {
    const { constituencyInfo, pollingStationInfo, voterStats, voters } = data;
    return (
        <div className="overflow-y-auto h-full pr-2">
            <InfoCard title="Constituency Info" icon={ICONS.constituency}>
                <InfoItem label="Assembly" value={`${constituencyInfo.assembly.number} - ${constituencyInfo.assembly.name} (${constituencyInfo.assembly.category})`} />
                <InfoItem label="Parliamentary" value={`${constituencyInfo.parliamentary.number} - ${constituencyInfo.parliamentary.name} (${constituencyInfo.parliamentary.category})`} />
            </InfoCard>

            <InfoCard title="Polling Station" icon={ICONS.polling}>
                <InfoItem label="Part No." value={pollingStationInfo.partNumber} />
                <InfoItem label="Name" value={pollingStationInfo.name} />
                <InfoItem label="Address" value={pollingStationInfo.address} />
                 <InfoItem label="District" value={pollingStationInfo.district} />
                <InfoItem label="PIN" value={pollingStationInfo.pinCode} />
            </InfoCard>
            
            <InfoCard title="Voter Statistics" icon={ICONS.stats}>
                <div className="grid grid-cols-2 gap-x-4">
                    <InfoItem label="Male" value={voterStats.maleVoters} />
                    <InfoItem label="Female" value={voterStats.femaleVoters} />
                    <InfoItem label="Other" value={voterStats.thirdGenderVoters} />
                    <InfoItem label="Total" value={voterStats.totalVoters} />
                </div>
            </InfoCard>
            
            <VoterTable voters={voters} />
        </div>
    );
};

export default ResultsDisplay;