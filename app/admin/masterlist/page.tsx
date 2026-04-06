"use client";

import useSWR from "swr";
import api from "@/lib/axios";
import {
    Loader2,
    Search,
    UserCheck,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface Student {
    student_id: string;
    full_name: string;
    college: string;
    course: string;
    balance: number;
    remaining_balance: number;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function MasterlistPage() {
    const { data: students, error, isLoading } = useSWR<Student[]>('/api/admin/students', fetcher);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filtered data logic
    const filteredStudents = useMemo(() => {
        return students?.filter(s =>
            s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
    }, [students, searchTerm]);

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Pagination Calculations
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

    const getCollegeBadge = (college: string) => {
        const c = college?.toUpperCase() || "";
        if (c.includes("CITE")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
        if (c.includes("CASE")) return "bg-blue-100 text-blue-700 border-blue-200";
        if (c.includes("CCJE")) return "bg-red-100 text-red-700 border-red-200";
        if (c.includes("COHME")) return "bg-orange-100 text-orange-700 border-orange-200";
        return "bg-slate-100 text-slate-700 border-slate-200";
    };

    if (error) return <div className="p-8 text-red-500 font-bold uppercase text-xs tracking-widest">Failed to load masterlist.</div>;

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Masterlist</h1>
                    <p className="text-sm text-slate-500 font-medium">Class of 2026 Graduation Records</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        className="w-full pl-12 text-slate-600 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 font-medium transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student Info</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">College</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} />
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Accessing Ledger...</p>
                                    </td>
                                </tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((student) => (
                                    <tr key={student.student_id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                    <UserCheck size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-none mb-1">{student.full_name}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{student.student_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border uppercase tracking-wider ${getCollegeBadge(student.college)}`}>
                                                {student.college}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <p className={`font-black text-lg ${(student.remaining_balance ?? 0) > 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                                                ₱{(student.remaining_balance ?? 0).toLocaleString()}
                                            </p>
                                            {(student.remaining_balance ?? 0) === 0 && (
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em]">
                                                    Fully Paid
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="py-20 text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No Records Found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!isLoading && filteredStudents.length > 0 && (
                    <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {startIndex + 1}—{Math.min(startIndex + itemsPerPage, filteredStudents.length)} <span className="mx-2 text-slate-200">/</span> {filteredStudents.length} Students
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} className="text-slate-600" />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Logic to show only a few pages if there are many
                                    if (totalPages > 5 && Math.abs(currentPage - page) > 1 && page !== 1 && page !== totalPages) {
                                        if (page === 2 || page === totalPages - 1) return <span key={page} className="px-1 text-slate-300">...</span>;
                                        return null;
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${currentPage === page
                                                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                                                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={16} className="text-slate-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}