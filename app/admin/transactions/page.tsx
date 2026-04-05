"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { 
    History, 
    User, 
    ShieldCheck, 
    Loader2, 
    ChevronLeft, 
    ChevronRight,
    Calendar
} from "lucide-react";

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function TransactionsPage() {
    const [page, setPage] = useState(1);

    // Fetching from backend with pagination params
    const { data, error, isValidating } = useSWR(
        `/api/admin/transactions?page=${page}`, 
        fetcher, 
        { keepPreviousData: true }
    );

    const transactions = data?.data || [];
    const meta = data; // Laravel pagination includes current_page, last_page, etc.

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                        Transaction History
                    </h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Master Ledger • Centralized Records
                    </p>
                </div>
                {isValidating && (
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                )}
            </header>

            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Reference Number</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student ID</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Collected By</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Date & Time</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50">
                            {transactions.map((t: any) => (
                                <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <User size={14} />
                                            </div>
                                            <span className="font-black text-slate-700 text-sm uppercase">
                                                {t.reference_number}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-400 tabular-nums">
                                        {t.student_id}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-emerald-500" />
                                            <span className="text-xs font-black text-slate-600 uppercase">
                                                {t.collector?.name || "System Admin"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                <Calendar size={10} />
                                                {new Date(t.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase italic">
                                                {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Backend Pagination Footer */}
                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {transactions.length} of {meta?.total || 0} Transactions
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase">
                            Page {meta?.current_page} of {meta?.last_page}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= (meta?.last_page || 1)}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}