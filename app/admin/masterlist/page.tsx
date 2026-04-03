"use client";

import useSWR from "swr";
import api from "@/lib/axios";
import { Loader2, Search, UserCheck, GraduationCap } from "lucide-react";
import { useState } from "react";

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

    const filteredStudents = students?.filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCollegeBadge = (college: string) => {
        const c = college?.toUpperCase() || "";
        if (c.includes("CITE")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
        if (c.includes("CASE")) return "bg-blue-100 text-blue-700 border-blue-200";
        if (c.includes("CCJE")) return "bg-red-100 text-red-700 border-red-200";
        if (c.includes("COHME")) return "bg-orange-100 text-orange-700 border-orange-200";
        return "bg-slate-100 text-slate-700 border-slate-200";
    };

    if (error) return <div className="p-8 text-red-500">Failed to load masterlist.</div>;

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase">Masterlist</h1>
                    <p className="text-sm text-slate-500 font-medium">Class of 2026 Graduation Records</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 font-medium transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student Info</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">College</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} />
                                        <p className="text-xs font-black uppercase text-slate-400">Loading Database...</p>
                                    </td>
                                </tr>
                            ) : filteredStudents?.map((student) => (
                                <tr key={student.student_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <UserCheck size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 leading-none mb-1">{student.full_name}</p>
                                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{student.student_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`w-fit px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${getCollegeBadge(student.college)}`}>
                                                {student.college}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {/* Use remaining_balance here */}
                                        <p className={`font-black text-lg ${(student.remaining_balance ?? 0) > 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                                            ₱{(student.remaining_balance ?? 0).toLocaleString()}
                                        </p>

                                        {/* Show 'Fully Paid' badge if remaining balance is 0 */}
                                        {(student.remaining_balance ?? 0) === 0 && (
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                                Fully Paid
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filteredStudents?.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Students Found</p>
                    </div>
                )}
            </div>
        </div>
    );
}