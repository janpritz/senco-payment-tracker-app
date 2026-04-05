"use client";

import { useState, useEffect } from "react";
import { db, formatPaymentForDexie, Payment } from "@/lib/db";
import api from "@/lib/axios";
import { X, Search, School, History, Loader2, User, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface StudentData {
    student_id: string;
    full_name: string;
    college: string;
    course: string;
    balance: number;
}

export default function PaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
    const [amount, setAmount] = useState("");
    const [searchError, setSearchError] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Constants
    const BASE_BALANCE = 4000;

    // Logic Validations
    const numericAmount = parseFloat(amount) || 0;
    const remainingBalance = selectedStudent?.balance || 0;
    const isOverLimit = numericAmount > BASE_BALANCE;
    const isOverRemaining = numericAmount > remainingBalance;
    const isInvalidAmount = !amount || numericAmount <= 0 || isOverRemaining;
    const isDisabled = !selectedStudent || isInvalidAmount || isSubmitting;

    const handleSearch = async () => {
        const cleanQuery = query.trim();
        setSearchError("");

        if (!cleanQuery) {
            setSelectedStudent(null);
            return;
        }

        setIsSearching(true);
        try {
            const found = await db.students
                .where('student_id').equals(cleanQuery)
                .or('full_name').startsWithIgnoreCase(cleanQuery)
                .first();

            if (found) {
                // Calculate current balance based on local payment history
                const payments = await db.payments
                    .where('student_id')
                    .equals(found.student_id)
                    .toArray();

                const totalPaid = payments.reduce(
                    (sum, p) => sum + (Number(p.amount) || 0),
                    0
                );

                const computedBalance = BASE_BALANCE - totalPaid;

                setSelectedStudent({
                    ...found,
                    balance: Math.max(0, computedBalance)
                });
            } else {
                setSelectedStudent(null);
                setSearchError("Student not found in local records.");
            }
        } catch (err) {
            setSearchError("Database error occurred.");
        } finally {
            setIsSearching(false);
        }
    };

    const processPayment = async () => {
        if (isDisabled || !selectedStudent) return;

        // 1. Prepare Local Data
        const localPayment: Payment = {
            student_id: selectedStudent.student_id,
            full_name: selectedStudent.full_name,
            amount: numericAmount,
            reference_number: `TEMP-${Date.now()}`, // Temporary ref
            sync_status: 'pending',
            created_at: new Date().toISOString(),
            date: new Date().toLocaleString('en-CA', { timeZone: 'Asia/Manila' }).split(',')[0],
        };

        const runSync = async () => {
            // Step A: Save to Dexie immediately (Safety First)
            const localId = await db.payments.add(localPayment);

            try {
                // Step B: Attempt Laravel API call
                const response = await api.post('/api/admin/payments', {
                    student_id: localPayment.student_id,
                    amount: localPayment.amount,
                });

                const serverData = response.data.payment || response.data;

                // Step C: Update local record with real Server ID and Ref
                await db.payments.update(localId, {
                    laravel_id: serverData.id,
                    reference_number: serverData.reference_number,
                    sync_status: 'synced'
                });

                return serverData;
            } catch (error) {
                // If API fails, it remains 'pending' in Dexie. 
                // We throw so the toast shows the "Saved Locally" warning.
                throw error;
            }
        };

        // Fire and forget
        toast.promise(runSync(), {
            loading: 'Saving transaction...',
            success: (data) => `Payment Saved for ${data.full_name}`,
            error: 'Saved locally (Offline). Syncing in background...',
        });

        onClose(); // Modal closes instantly
    };

    const getCollegeColor = (college: string) => {
        const c = college?.toUpperCase() || "";
        if (c.includes("CITE")) return "bg-emerald-600";
        if (c.includes("CASE")) return "bg-blue-600";
        if (c.includes("CCJE")) return "bg-red-600";
        if (c.includes("COHME")) return "bg-orange-500";
        return "bg-slate-900";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setSelectedStudent(null);
            setAmount("");
            setSearchError("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* Main Form Area */}
                <div className="flex-1 p-8 border-r border-slate-100 overflow-y-auto">
                    <header className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">New Transaction</h2>
                        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-900"><X size={24} /></button>
                    </header>

                    <div className="space-y-6">
                        {/* Student Lookup */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Student Lookup</label>
                            <div className="relative mt-2">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isSearching ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} size={20} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold outline-none text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    placeholder="Enter Student ID or Name..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" size={18} />}
                            </div>
                            {searchError && <p className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1">{searchError}</p>}
                        </div>

                        {selectedStudent && (
                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                                <div className={`p-5 rounded-2xl text-white shadow-lg transition-all ${getCollegeColor(selectedStudent.college)}`}>
                                    <div className="flex items-center gap-2 mb-1 opacity-70">
                                        <School size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{selectedStudent.college}</span>
                                    </div>
                                    <h3 className="font-black text-xl leading-tight truncate">{selectedStudent.full_name}</h3>
                                    <p className="text-[10px] opacity-80 font-bold">{selectedStudent.course}</p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400">Payment Amount (₱)</label>
                                        {isOverLimit && <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">Max Limit: ₱4,000</span>}
                                    </div>
                                    <input
                                        type="number"
                                        className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full mt-2 px-6 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black text-3xl outline-none transition-all ${isOverLimit || isOverRemaining ? 'ring-2 ring-red-500/50 bg-red-50' : 'focus:ring-2 focus:ring-emerald-500/20'}`}
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        // Prevents incrementing on scroll
                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                    />
                                    {isOverRemaining && (
                                        <p className="text-[10px] font-black text-red-500 mt-2 ml-1">
                                            Exceeds remaining balance (₱{remainingBalance.toLocaleString()})
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={processPayment}
                                    disabled={isDisabled}
                                    className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${isDisabled
                                        ? 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none'
                                        : 'bg-slate-900 hover:bg-emerald-600 active:scale-[0.98]'
                                        }`}
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                                    <span>{isSubmitting ? "Processing..." : "Save Payment"}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="w-full md:w-80 bg-slate-50 p-10 flex flex-col relative">
                    <button onClick={onClose} className="hidden md:block absolute top-6 right-6 text-slate-300 hover:text-slate-900">
                        <X size={20} />
                    </button>

                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <History size={14} /> Account Status
                    </h4>

                    {selectedStudent ? (
                        <div className="space-y-8 animate-in fade-in">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current Balance</span>
                                <p className="text-4xl font-black text-slate-900 mt-1">
                                    ₱{(Number(selectedStudent.balance) || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-slate-200">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Notice</p>
                                <p className="text-[11px] font-bold text-slate-600 italic">
                                    "Confirm physical cash matches input before saving."
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center opacity-30 text-center">
                            <User size={48} className="mb-4 text-slate-400" />
                            <p className="text-[10px] font-black uppercase text-slate-500">Search student<br />to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}