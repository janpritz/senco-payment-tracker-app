"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, RefreshCw, Wallet, Search, Loader2 } from "lucide-react";
import PaymentModal from "@/components/collection/PaymentModal";
import { toast } from "react-hot-toast"; // Recommended for feedback

export default function CollectionPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [stats, setStats] = useState({ total: 0, count: 0 });

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await api.get("/api/admin/masterlist?force=true");
            toast.success("Masterlist updated successfully!");
        } catch (error) {
            toast.error("Failed to sync sheets.");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Collections</h1>
                    <p className="text-slate-500 text-sm font-medium italic">SENCO Finance Committee Portal</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
                        {isSyncing ? "SYNCING..." : "SYNC SHEETS"}
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                        <Plus size={20} /> NEW PAYMENT
                    </button>
                </div>
            </div>

            {/* Placeholder for Collection History Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Wallet size={32} />
                </div>
                <h3 className="text-slate-900 font-bold">No recent collections displayed</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">Click "New Payment" to start recording student graduation dues.</p>
            </div>

            <PaymentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}