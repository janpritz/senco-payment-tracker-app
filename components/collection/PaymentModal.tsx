"use client";

import { useState, useEffect } from "react";
import { db, Payment } from "@/lib/db";
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
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const BASE_BALANCE = 4000;
    const numericAmount = parseFloat(amount) || 0;
    const remainingBalance = selectedStudent?.balance || 0;
    const isOverLimit = numericAmount > BASE_BALANCE;
    const isOverRemaining = numericAmount > remainingBalance;
    const isDisabled = !selectedStudent || !amount || numericAmount <= 0 || isOverRemaining || isSubmitting;

    const handleSearch = async () => {
        const cleanQuery = query.trim();
        if (!cleanQuery) return;
        setIsSearching(true);
        try {
            const found = await db.students.where('student_id').equals(cleanQuery).or('full_name').startsWithIgnoreCase(cleanQuery).first();
            if (found) {
                const payments = await db.payments.where('student_id').equals(found.student_id).reverse().toArray();
                setPaymentHistory(payments);
                const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                setSelectedStudent({ ...found, balance: Math.max(0, BASE_BALANCE - totalPaid) });
            } else {
                setSearchError("Student not found.");
            }
        } finally {
            setIsSearching(false);
        }
    };

    const processPayment = async () => {
        if (isDisabled || !selectedStudent) return;
        const localPayment: Payment = {
            student_id: selectedStudent.student_id,
            full_name: selectedStudent.full_name,
            amount: numericAmount,
            reference_number: `TEMP-${Date.now()}`,
            sync_status: 'pending',
            created_at: new Date().toISOString(),
            date: new Date().toLocaleString('en-CA', { timeZone: 'Asia/Manila' }).split(',')[0],
        };

        const runSync = async () => {
            const localId = await db.payments.add(localPayment);
            const response = await api.post('/admin/payments', { student_id: localPayment.student_id, amount: localPayment.amount });
            const serverData = response.data.payment || response.data;
            await db.payments.update(localId, { laravel_id: serverData.id, reference_number: serverData.reference_number, sync_status: 'synced' });
            return serverData;
        };

        toast.promise(runSync(), { loading: 'Saving...', success: 'Payment Saved', error: 'Saved locally (Offline).' });
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            setQuery(""); setSelectedStudent(null); setPaymentHistory([]); setAmount(""); setSearchError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                
                <div className="flex-1 p-8 border-r border-slate-100 overflow-y-auto">
                    <header className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">New Transaction</h2>
                        <button onClick={onClose} className="md:hidden text-slate-400"><X size={24} /></button>
                    </header>
                    
                    <StudentPaymentForm 
                      {...{query, setQuery, isSearching, searchError, selectedStudent, amount, setAmount, isOverLimit, isOverRemaining, remainingBalance, isDisabled, isSubmitting}}
                      onSearch={handleSearch}
                      onSubmit={processPayment}
                    />
                </div>

                <div className="w-full md:w-80 bg-slate-50 p-8 flex flex-col relative overflow-hidden">
                    <button onClick={onClose} className="hidden md:block absolute top-6 right-6 text-slate-300 hover:text-slate-900"><X size={20} /></button>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <History size={14} /> Payment History
                    </h4>
                    <PaymentHistory selectedStudent={selectedStudent} history={paymentHistory} />
                </div>
            </div>
        </div>
    );
}