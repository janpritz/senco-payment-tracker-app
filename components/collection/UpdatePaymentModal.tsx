"use client";

import { useState } from "react";
import { Edit3, X, Loader2, Info } from "lucide-react";
import api from "@/lib/axios";
import { mutate } from "swr";
import { toast } from "react-hot-toast";

export default function UpdatePaymentModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [oldAmount, setOldAmount] = useState<number | null>(null);
    const [studentName, setStudentName] = useState("");

    const [formData, setFormData] = useState({
        reference_number: "",
        amount: "",
    });

    const fetchOldAmount = async () => {
        if (!formData.reference_number) return;

        setFetching(true);
        setOldAmount(null);
        try {
            // Change the URL to use a query parameter (?ref=)
            const res = await api.get(`/api/admin/payments/lookup?ref=${encodeURIComponent(formData.reference_number)}`);
            setOldAmount(res.data.amount);
            setStudentName(res.data.student);
        } catch (error) {
            toast.error("Reference number not found.");
        } finally {
            setFetching(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch("/api/admin/payments/update-amount", formData);
            mutate("/api/admin/payments");
            setIsOpen(false);
            resetForm();
            toast.success("Payment updated successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ reference_number: "", amount: "" });
        setOldAmount(null);
        setStudentName("");
    }

    if (!isOpen) return (
        <button
            onClick={() => setIsOpen(true)}
            className="bg-purple-900 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
        >
            <Edit3 size={14} /> Update Amount
        </button>
    );

    return (
        <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase">Update Payment</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correction Module</p>
                    </div>
                    <button onClick={() => { setIsOpen(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    {/* Reference Number Input */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference Number</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                placeholder="Press Enter to lookup..."
                                className="w-full text-slate-900 mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all"
                                value={formData.reference_number}
                                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), fetchOldAmount())}
                            />
                            {fetching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-purple-500" size={16} />}
                        </div>
                    </div>

                    {/* Display Area for Old Amount */}
                    {oldAmount !== null && (
                        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-start gap-3">
                                <div className="bg-purple-500 p-1.5 rounded-lg text-white">
                                    <Info size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Current Record</p>
                                    <p className="text-sm font-black text-purple-900 mt-0.5">{studentName}</p>
                                    <p className="text-xs font-bold text-purple-600">Current Amount: ₱{oldAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* New Amount Input */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Corrected Amount (₱)</label>
                        <input
                            required
                            type="number"
                            placeholder="0.00"
                            className="w-full text-slate-900 mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={loading || fetching || !oldAmount}
                        type="submit"
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Finalize Changes"}
                    </button>
                    {!oldAmount && <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lookup Reference Number First</p>}
                </form>
            </div>
        </div>
    );
}