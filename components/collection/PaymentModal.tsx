"use client";

import { useState, useEffect } from "react";
import { db, Payment } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import api from "@/lib/axios";
import { X, History } from "lucide-react";
import { toast } from "react-hot-toast";
import { StudentPaymentForm } from "./StudentPaymentForm";
import { PaymentHistory } from "./PaymentHistory";

export default function PaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
    const [amount, setAmount] = useState("");
    const [searchError, setSearchError] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const BASE_BALANCE = 4000;
    const numericAmount = parseFloat(amount) || 0;
    const remainingBalance = selectedStudent?.balance || 0;
    const isOverLimit = numericAmount > 4000;
    const isOverRemaining = numericAmount > remainingBalance;
    const isDisabled = !selectedStudent || !amount || numericAmount <= 0 || isOverRemaining || isSubmitting;

    const suggestions = useLiveQuery(
        async () => {
            if (query.length < 2 || selectedStudent) return [];
            return await db.students
                .filter(s =>
                    s.student_id.toLowerCase().includes(query.toLowerCase()) ||
                    s.full_name.toLowerCase().includes(query.toLowerCase())
                )
                .limit(5)
                .toArray();
        },
        [query, selectedStudent]
    );

    const isSearching = query.length >= 2 && suggestions === undefined;

    // Inside PaymentModal.tsx
    const handleSelectStudent = async (student: any | null) => {
        // If student is null (input cleared), reset everything
        if (!student) {
            setQuery("");
            setSelectedStudent(null);
            setPaymentHistory([]);
            setAmount("");
            setSearchError("");
            setShowSuggestions(false);
            return;
        }

        // Otherwise, proceed with selection logic
        setQuery(student.student_id);
        setShowSuggestions(false);
        setSearchError("");

        const payments = await db.payments
            .where('student_id')
            .equals(student.student_id)
            .reverse()
            .toArray();

        setPaymentHistory(payments);
        const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        setSelectedStudent({
            ...student,
            balance: Math.max(0, BASE_BALANCE - totalPaid)
        });
    };

    const processPayment = async () => {
        if (isDisabled || !selectedStudent) return;
        setIsSubmitting(true);

        const localPayment: Payment = {
            student_id: selectedStudent.student_id,
            full_name: selectedStudent.full_name,
            amount: numericAmount,
            reference_number: `TEMP-${Date.now()}`,
            sync_status: 'pending',
            created_at: new Date().toISOString(),
            date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date()),
        };

        const runSync = async () => {
            try {
                const localId = await db.payments.add(localPayment);
                const response = await api.post('/admin/payments', {
                    student_id: localPayment.student_id,
                    amount: localPayment.amount
                });
                const serverData = response.data.payment || response.data;
                await db.payments.update(localId, {
                    laravel_id: serverData.id,
                    reference_number: serverData.reference_number,
                    sync_status: 'synced'
                });
                return serverData;
            } finally {
                setIsSubmitting(false);
            }
        };

        toast.promise(runSync(), {
            loading: 'Saving...',
            success: 'Payment Saved',
            error: 'Saved locally (Offline).'
        });
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            setQuery(""); setSelectedStudent(null); setPaymentHistory([]); setAmount("");
            setSearchError(""); setShowSuggestions(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md">
            {/* --- BIGGER MODAL CONTAINER: max-w-6xl and h-[85vh] --- */}
            <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row border border-white/20 animate-in fade-in zoom-in duration-300">

                {/* Left Side: Form (Wider padding and space) */}
                <div className="flex-[1.5] p-12 border-r border-slate-100 overflow-y-auto relative bg-white">
                    <header className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">New Transaction</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Payment Collection System</p>
                        </div>
                        <button onClick={onClose} className="md:hidden text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-all">
                            <X size={28} />
                        </button>
                    </header>

                    <StudentPaymentForm
                        {...{
                            query, setQuery, isSearching, searchError, selectedStudent,
                            amount, setAmount, isOverLimit, isOverRemaining, remainingBalance,
                            isDisabled, isSubmitting, suggestions, showSuggestions, setShowSuggestions
                        }}
                        onSelect={handleSelectStudent}
                        onSubmit={processPayment}
                    />
                </div>

                {/* Right Side: History (Darker contrast for depth) */}
                <div className="w-full md:w-[400px] bg-slate-50 p-12 flex flex-col relative overflow-hidden">
                    <button onClick={onClose} className="hidden md:block absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
                        <X size={24} />
                    </button>

                    <div className="mb-8">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <History size={16} className="text-blue-500" /> Payment History
                        </h4>
                        <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <PaymentHistory selectedStudent={selectedStudent} history={paymentHistory} />
                    </div>
                </div>
            </div>
        </div>
    );
}