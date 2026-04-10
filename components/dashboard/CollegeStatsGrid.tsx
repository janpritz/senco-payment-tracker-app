"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Banknote, Users, CheckCircle, ArrowUpRight, Loader2 } from "lucide-react";

interface CollegeStat {
    college: string;
    total_collected: number;
    student_count: number;
    paid_in_full: number;
}

interface AllTimeData {
    overall_total: number;
    college_stats: CollegeStat[];
}

// Color mapping object based on the college name
const collegeStyles: Record<string, { border: string, bg: string, text: string, bar: string }> = {
    CITE: { 
        border: "group-hover:border-emerald-500/30", 
        bg: "group-hover:bg-emerald-50", 
        text: "group-hover:text-emerald-600", 
        bar: "bg-emerald-500" 
    },
    CASE: { 
        border: "group-hover:border-blue-500/30", 
        bg: "group-hover:bg-blue-50", 
        text: "group-hover:text-blue-600", 
        bar: "bg-blue-500" 
    },
    CCJE: { 
        border: "group-hover:border-rose-500/30", 
        bg: "group-hover:bg-rose-50", 
        text: "group-hover:text-rose-600", 
        bar: "bg-rose-500" 
    },
    COHME: { 
        border: "group-hover:border-amber-500/30", 
        bg: "group-hover:bg-amber-50", 
        text: "group-hover:text-amber-600", 
        bar: "bg-amber-500" 
    },
};

export default function AllTimeStats() {
    const [data, setData] = useState<AllTimeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllTimeStats = async () => {
            try {
                const response = await api.get("/admin/reports/all-time-stats");
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch all-time stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllTimeStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-slate-50 animate-pulse h-40 rounded-2xl border border-slate-100" />
                ))}
            </div>
        );
    }

    if (!data || !data.college_stats) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.college_stats.map((item: CollegeStat) => {
                    // Fallback to slate if the college name doesn't match our map
                    const style = collegeStyles[item.college] || {
                        border: "group-hover:border-slate-400",
                        bg: "group-hover:bg-slate-50",
                        text: "group-hover:text-slate-600",
                        bar: "bg-slate-500"
                    };

                    return (
                        <div 
                            key={item.college} 
                            className={`group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all ${style.border}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`text-[10px] font-black px-2 py-1 bg-slate-100 rounded-md text-slate-600 transition-colors uppercase ${style.bg} ${style.text}`}>
                                    {item.college}
                                </div>
                                {/* <ArrowUpRight size={16} className={`text-slate-300 transition-colors ${style.text}`} /> */}
                            </div>

                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">All-Time Collection</p>
                            <h3 className="text-xl font-black text-slate-900 mb-4">
                                ₱{(item.total_collected ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}