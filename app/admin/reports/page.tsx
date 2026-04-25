"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { 
  FileText, Calendar, AlertCircle, 
  CheckCircle, Search, Plus, Users 
} from "lucide-react";
import { format } from "date-fns";
import ReportModal from "@/components/reports/ReportModal";

interface CollectionReport {
    id: number;
    report_date: string;
    total_collected: number;
    transaction_count: number;
    summary: string;
    issues: string;
    resolutions: string;
    user: { name: string };
}

interface Collector {
    id: number;
    name: string;
}

interface ApiResponse {
    reports: CollectionReport[];
    collectors_today: Collector[];
}

export default function ReportsSummaryPage() {
    const [reports, setReports] = useState<CollectionReport[]>([]);
    const [collectorsToday, setCollectorsToday] = useState<Collector[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            // Explicitly cast the API response to our new interface
            const res = await api.get<ApiResponse>("/admin/reports");
            
            // Fixes the .filter error by accessing the correct keys
            setReports(res.data.reports || []);
            setCollectorsToday(res.data.collectors_today || []);
        } catch (err) {
            console.error("Failed to fetch reports:", err);
            setReports([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const filteredReports = reports.filter(r => 
        r.summary.toLowerCase().includes(filter.toLowerCase()) || 
        r.report_date.includes(filter)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Daily Narratives</h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Collection Issues & Resolutions Archive</p>
                    </div>

                    {/* NEW: Collectors Today Display */}
                    {collectorsToday.length > 0 && (
                        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-slate-100 w-fit shadow-sm">
                            <div className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                <Users size={16} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Active Today</p>
                                <p className="text-[11px] font-bold text-slate-700">
                                    {collectorsToday.map(c => c.name).join(", ")}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by date or text..." 
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all"
                    >
                        <Plus size={18} strokeWidth={3} />
                        New Narrative
                    </button>
                </div>
            </header>

            {/* Reports List */}
            <div className="grid gap-6">
                {isLoading ? (
                    <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest">Loading Archives...</div>
                ) : filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                        <div key={report.id} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                            {/* ... (rest of your mapping logic remains the same) ... */}
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white">
                                        <span className="text-[10px] font-black uppercase leading-none opacity-60">{format(new Date(report.report_date), 'MMM')}</span>
                                        <span className="text-xl font-black leading-none">{format(new Date(report.report_date), 'dd')}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight">Narrative Report</h3>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                            <Calendar size={12} /> {format(new Date(report.report_date), 'EEEE, yyyy')} • By {report.user?.name}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <div className="px-4 py-2 bg-blue-50 rounded-xl text-center">
                                        <p className="text-[9px] font-black text-blue-400 uppercase leading-none">Total Collected</p>
                                        <p className="text-sm font-black text-blue-600 mt-1">₱{Number(report.total_collected).toLocaleString()}</p>
                                    </div>
                                    <div className="px-4 py-2 bg-slate-50 rounded-xl text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Transactions</p>
                                        <p className="text-sm font-black text-slate-900 mt-1">{report.transaction_count}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText size={14} className="text-slate-900" /> Day Summary
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{report.summary}</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle size={14} className="text-red-500" /> Issues
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{report.issues || "No issues reported."}</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle size={14} className="text-emerald-500" /> Resolutions
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{report.resolutions || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-20 bg-slate-100 rounded-[40px] text-center">
                        <p className="font-black text-slate-400 uppercase tracking-widest">No reports found for this period.</p>
                    </div>
                )}
            </div>

            <ReportModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    fetchReports(); 
                }} 
            />
        </div>
    );
}