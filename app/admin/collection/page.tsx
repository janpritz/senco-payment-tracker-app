"use client";

import { useState, useMemo } from "react";
import { db, formatPaymentForDexie } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import useSWR from "swr";
import api from "@/lib/axios";
import { Plus, History, User, Wallet, Loader2 } from "lucide-react";
import PaymentModal from "@/components/collection/PaymentModal";
import { toast } from "react-hot-toast";

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function CollectionPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Today's date in YYYY-MM-DD for filtering
    const today = useMemo(() => new Date().toISOString().split("T")[0], []);

    /** -----------------------------
     *  1️⃣ Live Dexie Payments Query
     *  Only today's payments, newest first
     * ----------------------------- */
    const payments = useLiveQuery(
        () => db.payments.where("date").equals(today).reverse().toArray(),
        [today]
    );

    /** -----------------------------
     *  2️⃣ Background Sync: Payments
     * ----------------------------- */
    const { isValidating: syncingPayments } = useSWR("/api/admin/payments", fetcher, {
        refreshInterval: 10_000, // auto-refresh every 10s
        onSuccess: async (data) => {
            if (!Array.isArray(data)) return;

            const formatted = data.map(formatPaymentForDexie);

            // Optional: auto-delete older payments (not today) for cache hygiene
            await db.payments.where("date").below(today).delete();

            await db.transaction("rw", db.payments, async () => {
                for (const p of formatted) {
                    const existing = await db.payments
                        .where("laravel_id")
                        .equals(p.laravel_id!)
                        .first();

                    if (existing) {
                        await db.payments.update(existing.id!, p);
                    } else {
                        await db.payments.add(p);
                    }
                }
            });
        }
    });

    /** -----------------------------
     *  3️⃣ Background Sync: Masterlist
     * ----------------------------- */
    const { isValidating: syncingMasterlist } = useSWR("/api/admin/students", fetcher, {
        revalidateOnFocus: false,
        onSuccess: async (data) => {
            if (!Array.isArray(data)) return;

            await db.transaction("rw", db.students, async () => {
                // Clear and refill for 100% consistency
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
                        {payments?.length ?? 0} RECORDS
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        {/* Table Header */}
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Student Name
                                </th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Student ID
                                </th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Amount Paid
                                </th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                                    Transaction Date
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50">
                            {payments?.length ? (
                                payments.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <User size={14} />
                                                </div>
                                                <span className="font-black text-slate-600 text-sm uppercase tracking-tight">
                                                    {p.full_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-400 tabular-nums">
                                            {p.student_id}
                                        </td>
                                        <td className="px-8 py-5 text-emerald-600 font-black text-sm">
                                            ₱{Number(p.amount).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-right text-xs font-bold text-slate-400 italic uppercase">
                                            {new Date(p.created_at).toLocaleDateString("en-US", {
                                                month: "long",
                                                day: "2-digit"
                                            })}{" "}
                                            {new Date(p.created_at).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true
                                            })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="p-20 text-center" colSpan={4}>
                                        <Wallet
                                            size={40}
                                            className="mx-auto text-slate-100 mb-4"
                                        />
                                        <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">
                                            Cache Empty • Waiting for Sync
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}