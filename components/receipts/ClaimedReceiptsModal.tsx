"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, FileText, User, Calendar, Hash, SquareUserRound  } from "lucide-react";
import { getClaimedReceipts } from "@/services/receiptService";

interface ClaimedReceiptsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ClaimedReceiptsModal = ({ isOpen, onClose }: ClaimedReceiptsModalProps) => {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Initial Data Load
    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                setLoading(true);
                const data = await getClaimedReceipts();
                setReceipts(data);
                setLoading(false);
            };
            loadData();
        }
    }, [isOpen]);

    // Real-time filtering
    const filteredReceipts = useMemo(() => {
        const query = search.toLowerCase();
        return receipts.filter(r => 
            r.full_name.toLowerCase().includes(query) || 
            r.student_id.includes(query)
        );
    }, [search, receipts]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
                
                {/* Header Section */}
                <div className="p-8 border-b bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Claimed Records</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">History Log</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Internal Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search history..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-11 pr-4 py-2.5 bg-white border-2 text-slate-600 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all w-64"
                            />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-bold">
                            Loading records...
                        </div>
                    ) : filteredReceipts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredReceipts.map((item) => (
                                <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <FileText size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-800 leading-tight">{item.full_name}</h4>
                                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                                                Completed
                                            </span>
                                        </div>
                                        
                                        <div className="mt-3 space-y-1.5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                <Hash size={14} /> {item.student_id}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                <Calendar size={14} /> Claimed: {item.claimed_at}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                <SquareUserRound  size={14} /> Released By: {item.released_by || "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12">
                            <div className="p-6 bg-slate-100 rounded-full text-slate-300 mb-4">
                                <Search size={48} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-500">No records found</h3>
                            <p className="text-sm text-slate-400">Try adjusting your search or check back later.</p>
                        </div>
                    )}
                </div>

                {/* Footer / Stats */}
                <div className="px-8 py-4 bg-white border-t flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Total Claimed: {receipts.length}</span>
                    <span>Displaying: {filteredReceipts.length}</span>
                </div>
            </div>
        </div>
    );
};