"use client";

import { useState } from "react";
import { useReceiptsData, StudentWithBalance } from "./hooks/useReceiptsData";
import { generateFullyPaidReceipts } from '@/services/receiptGenerator';
import { db } from "@/lib/db";
import { FileDown, RefreshCw, CheckCircle2, Database } from 'lucide-react';

// Components
import { StatsCards } from "./components/StatsCard";
import { StudentModal } from "@/components/receipts/StudentModal";
import ClaimModal from "@/components/receipts/ClaimModal";
import { ClaimedReceiptsModal } from "@/components/receipts/ClaimedReceiptsModal";

const ReportsPage = () => {
    const { loading, syncing, stats, syncAndLoadData, loadFromIndexedDB } = useReceiptsData();
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", type: "fully_paid" as any, data: [] as StudentWithBalance[] });

    const handleBulkExport = async () => {
        const claims = stats.pendingExportData.map(s => ({
            id: s.filing_id!,
            full_name: s.full_name,
            student_id: s.student_id,
            remaining_balance: s.remaining_balance,
            payments: s.payments
        }));

        generateFullyPaidReceipts(claims);

        try {
            await db.receipt_claims.where('id').anyOf(claims.map(c => c.id)).modify({ is_exported: true });
            localStorage.setItem('last_exported_count', (stats.totalExported + claims.length).toString());
            loadFromIndexedDB();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">SENCO Receipts</h1>
                    <p className="text-gray-600">Manage Graduation Fee Receipts & Claims</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsClaimModalOpen(true)} className="flex items-center gap-2 border-2 border-green-600 text-green-600 px-5 py-2 rounded-xl font-bold hover:bg-green-50 transition-all">
                        <CheckCircle2 size={18} /> Claim Receipt
                    </button>
                    <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full ${syncing ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {syncing ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
                        {syncing ? "SYNCING..." : "LIVE DATA READY"}
                    </div>
                </div>
            </header>

            <StatsCards 
                stats={stats} 
                onCardClick={(title: string, type: any, data: any) => setModalConfig({ isOpen: true, title, type, data })}
                onHistoryClick={() => setIsHistoryModalOpen(true)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sync Action */}
                <div className="bg-white rounded-2xl border p-6 flex items-center justify-between shadow-sm">
                    <div className="flex gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><RefreshCw size={24} /></div>
                        <div>
                            <h3 className="font-bold">Sync Data</h3>
                            <p className="text-sm text-gray-500">Force update local cache.</p>
                        </div>
                    </div>
                    <button onClick={syncAndLoadData} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700">
                        Sync Now
                    </button>
                </div>

                {/* Bulk Export Action */}
                <button 
                    onClick={handleBulkExport}
                    disabled={stats.pendingExportCount === 0 || loading}
                    className="bg-white p-6 rounded-xl border-2 border-red-200 text-slate-600 flex items-center gap-4 hover:border-red-400 transition-all disabled:opacity-50"
                >
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg"><FileDown size={24} /></div>
                    <div className="text-left">
                        <h3 className="font-bold">Bulk Official Receipts</h3>
                        <p className="text-sm text-gray-500">Export {stats.pendingExportCount} unprinted receipts.</p>
                    </div>
                </button>
            </div>

            <StudentModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({...modalConfig, isOpen: false})} title={modalConfig.title} type={modalConfig.type} students={modalConfig.data} />
            <ClaimModal isOpen={isClaimModalOpen} onClose={() => setIsClaimModalOpen(false)} onClaimSuccess={loadFromIndexedDB} />
            <ClaimedReceiptsModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} />
        </div>
    );
};

export default ReportsPage;