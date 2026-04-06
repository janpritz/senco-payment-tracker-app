"use client";

import useSWR from "swr";
import api from "@/lib/axios";
import { useAdminLogin } from "@/hooks/useAdminLogin";
import {
    Receipt,
    Search,
    Download,
    User,
    Clock,
    ChevronLeft,
    ChevronRight,
    Calendar
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import UpdatePaymentModal from "@/components/collection/UpdatePaymentModal";

interface PaymentRecord {
    id: string;
    student_id: string;
    full_name: string;
    amount: number;
    college: string;
    reference_number: string;
    created_at: string;
    time: string;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function PaymentsPage() {
    const { data: payments, isLoading } = useSWR<PaymentRecord[]>('/api/admin/payments', fetcher);
    const [search, setSearch] = useState("");
    const { state } = useAdminLogin();
    const [role, setRole] = useState<string | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRole(user.role);
        }
    }, [state.user]);

    const isAdmin = role === 'Admin';

    // Filtered data logic
    const filtered = useMemo(() => {
        return payments?.filter(p =>
            p.full_name.toLowerCase().includes(search.toLowerCase()) ||
            p.reference_number.toLowerCase().includes(search.toLowerCase()) ||
            p.student_id.toLowerCase().includes(search.toLowerCase()) ||
            p.college.toLowerCase().includes(search.toLowerCase())
        ) || [];
    }, [payments, search]);

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // Pagination Calculations
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Transaction Ledger</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Official Payment Records • SENCO 2026</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search REF# or Name..."
                            className="pl-12 pr-4 py-3 text-slate-600 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/5 w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {isAdmin && <UpdatePaymentModal />}
                </div>
            </header>

            <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">College</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Reference</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Student ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Full Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Time Stamp</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedData.map((pay) => (
                                <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="text-slate-900 text-sm tracking-tight">{pay.college}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-slate-900 text-sm tracking-tight">{pay.reference_number}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded">
                                            {pay.student_id}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-slate-900 text-sm">{pay.full_name}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                <Calendar size={10} />
                                                {new Date(pay.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase italic">
                                                {new Date(pay.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
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

                {/* Pagination Controls */}
                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={18} className="text-slate-600" />
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                                        currentPage === page 
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={18} className="text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}