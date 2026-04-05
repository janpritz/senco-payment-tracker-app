"use client";

import { useState, useMemo } from "react";
import { db, formatPaymentForDexie } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import useSWR from "swr";
import api from "@/lib/axios";
import { Plus, History, User, Wallet, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import PaymentModal from "@/components/collection/PaymentModal";
import { toast } from "react-hot-toast";

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function CollectionPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    /** -----------------------------
     * 1️⃣ Manila-Specific Today Date
     * ----------------------------- */
    // Inside your CollectionPage component
    const today = useMemo(() => {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date());
    }, []);

    // Your Dexie Query remains fast because 'date' is indexed
    const payments = useLiveQuery(
        () => db.payments
            .where("date")
            .equals(today)
            .reverse() // Newest today at the top
            .offset((currentPage - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .toArray(),
        [today, currentPage]
    );

    const totalCount = useLiveQuery(
        () => db.payments.where("date").equals(today).count(),
        [today]
    );

    const totalPages = Math.ceil((totalCount || 0) / itemsPerPage);

    /** -----------------------------
     * 2️⃣ Background Sync: Payments
     * ----------------------------- */
    const { isValidating: syncingPayments } = useSWR("/api/admin/payments", fetcher, {
        refreshInterval: 10_000,
        onSuccess: async (data) => {
            if (!Array.isArray(data)) return;
            const formatted = data.map(formatPaymentForDexie);

            await db.payments.where("date").below(today).delete();

            await db.transaction("rw", db.payments, async () => {
                for (const p of formatted) {
                    // 1. Try to find the record by the Laravel ID index
                    const existing = await db.payments
                        .where("laravel_id")
                        .equals(p.laravel_id!)
                        .first();

                    if (existing) {
                        // 2. Update using the Dexie internal ++id
                        await db.payments.update(existing.id!, {
                            ...p,
                            id: existing.id // Keep the same internal ID
                        });
                    } else {
                        // 3. Fresh insert
                        await db.payments.add(p);
                    }
                }
            });
        }
    });

    /** -----------------------------
     * 3️⃣ Background Sync: Masterlist
     * ----------------------------- */
    const { isValidating: syncingMasterlist } = useSWR("/api/admin/students", fetcher, {
        revalidateOnFocus: false,
        onSuccess: async (data) => {
            if (!Array.isArray(data)) return;
            await db.transaction("rw", db.students, async () => {
                await db.students.clear();
                const validatedData = data.map((s) => ({
                    ...s,
                    balance: Number(s.balance) || 0
                }));
                await db.students.bulkAdd(validatedData);
            });
            toast.success("Masterlist updated");
        }
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                        Collections
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        {(syncingPayments || syncingMasterlist) && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase animate-pulse">
                                <Loader2 size={10} className="animate-spin" />
                                {syncingPayments ? "Payments syncing..." : "Masterlist syncing..."}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> NEW PAYMENT
                </button>
            </header>

            {/* Payments Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        <History size={14} /> Today's Activity
                    </h3>
                    <span className="text-[10px] font-black text-slate-500 px-3 py-1 bg-white border border-slate-100 rounded-full">
                        {totalCount ?? 0} RECORDS
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student Name</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student ID</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount Paid</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Transaction Date</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50">
                            {payments?.length ? (
                                payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <User size={14} />
                                                </div>
                                                <span className="font-black text-slate-600 text-sm uppercase tracking-tight">{p.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-400 tabular-nums">{p.student_id}</td>
                                        <td className="px-8 py-5 text-emerald-600 font-black text-sm">₱{Number(p.amount).toLocaleString()}</td>
                                        <td className="px-8 py-5 text-right text-xs font-bold text-slate-400 italic uppercase">
                                            {new Date(p.created_at).toLocaleDateString("en-US", { month: "long", day: "2-digit" })}{" "}
                                            {new Date(p.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="p-20 text-center" colSpan={4}>
                                        <Wallet size={40} className="mx-auto text-slate-100 mb-4" />
                                        <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">Cache Empty • Waiting for Sync</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}