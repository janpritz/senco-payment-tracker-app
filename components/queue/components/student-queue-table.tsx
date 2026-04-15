"use client";

import useSWR from 'swr';
import api from '@/lib/axios';
import { fixEncoding } from '@/lib/utils';

interface QueueEntry {
    id: number;
    student_id: string;
    name: string;
    status: 'waiting' | 'serving' | 'completed';
    created_at: string;
}

// Interface to match your new JSON structure
interface QueueResponse {
    now_serving: QueueEntry | null;
    upcoming: QueueEntry[];
    total_waiting: number;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export const StudentQueueTable = () => {
    // SWR now expects the QueueResponse object
    const { data, error, isLoading } = useSWR<QueueResponse>('/admin/queue/status', fetcher, {
        refreshInterval: 0// No polling, manual refresh only 
    });

    if (error) return <div className="p-8 text-center text-red-500 font-medium">Failed to load queue.</div>;
    if (isLoading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading queue data...</div>;

    // Extract the upcoming array from the object
    const upcomingStudents = data?.upcoming || [];

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student ID</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Entered</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {upcomingStudents.length > 0 ? (
                        upcomingStudents.map((entry, index) => (
                            <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                {/* Descending Count Logic */}
                                <td className="px-6 py-4 text-sm font-bold text-slate-400">
                                    {index + 1}
                                </td>

                                <td className="px-6 py-4 text-sm font-mono font-medium text-slate-600">
                                    {entry.student_id}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                    {fixEncoding(entry.name)}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                        ${entry.status === 'waiting' ? 'bg-orange-100 text-orange-600' :
                                            'bg-blue-100 text-blue-600'}
                    `}>
                                        {entry.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                                No students in the upcoming queue.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};