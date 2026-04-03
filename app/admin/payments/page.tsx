"use client";

import useSWR from "swr";
import api from "@/lib/axios";
import {
    Receipt,
    Search,
    Download,
    User,
    Clock
} from "lucide-react";
import { useState } from "react";

interface PaymentRecord {
    id: string;
    student_id: string;
    full_name: string;
    amount: number;
    reference_number: string; // Matches Laravel Backend Key
    created_at: string;   // Original ISO string from DB
    time: string;         // Pre-formatted 12h time from Backend
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function PaymentsPage() {
    const { data: payments, isLoading } = useSWR<PaymentRecord[]>('/api/admin/payments', fetcher);
    const [search, setSearch] = useState("");

    const filtered = payments?.filter(p =>
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.reference_number.toLowerCase().includes(search.toLowerCase()) ||
        p.student_id.toLowerCase().includes(search.toLowerCase())
    );
    const formatTime = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);

        // Check if the date is actually valid before formatting
        if (isNaN(date.getTime())) return "Invalid Time";

        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Transaction Ledger</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Official Payment Records • SENCO 2026</p>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search REF# or Name..."
                            className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/5 w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all">
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </header>

            <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Reference</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Student ID</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Full Name</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Time Stamp</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered?.map((pay) => (
                            <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-900 text-sm tracking-tight">{pay.reference_number}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-xs text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded">
                                        {pay.student_id}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className=" text-slate-900 text-sm">{pay.full_name}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                        <Clock size={14} className="text-blue-500" />
                                        {formatTime(pay.created_at)}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className="font-black text-slate-900 text-base">
                                        ₱{Number(pay.amount).toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}