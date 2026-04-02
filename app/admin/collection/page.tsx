"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { 
    Search, 
    Plus, 
    Filter, 
    Download, 
    UserCheck, 
    Clock, 
    Wallet,
    MoreHorizontal,
    Printer
} from "lucide-react";

export default function CollectionPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Fetch collections/payments
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await api.get("/api/admin/collections");
                setStudents(response.data);
            } catch (error) {
                console.error("Failed to fetch collections", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, []);

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">COLLECTIONS</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage graduation dues and student payments</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <Download size={18} /> EXPORT
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                        <Plus size={18} /> NEW PAYMENT
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Collected" value="₱ 45,250" icon={<Wallet className="text-blue-600" />} color="bg-blue-50" />
                <StatCard title="Fully Paid" value="124" icon={<UserCheck className="text-green-600" />} color="bg-green-50" />
                <StatCard title="Pending" value="42" icon={<Clock className="text-orange-600" />} color="bg-orange-50" />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search student name or ID..."
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
                        <Filter size={16} /> Filter By Course
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {/* Example Row */}
                            <tr className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">Fritz Cabalhin</div>
                                    <div className="text-[10px] text-slate-400 font-mono">ID: 2022-0001</div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-600 tracking-tight">BS Information Technology</td>
                                <td className="px-6 py-4 font-black text-slate-900">₱ 1,500.00</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase">Fully Paid</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Print Receipt">
                                            <Printer size={18} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-all">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Sub-component for Stats
function StatCard({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <h3 className="text-2xl font-black text-slate-900">{value}</h3>
            </div>
        </div>
    );
}