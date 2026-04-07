"use client";

import { useState } from "react";
import { Target, Save, Settings, ArrowRight } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";

interface GoalProps {
    currentCollected: number;
    totalStudents: number;
    initialGoal: number;
    onGoalUpdate: (newAmount: number) => void;
}

export default function ContributionGoal({
    currentCollected,
    totalStudents,
    initialGoal,
    onGoalUpdate
}: GoalProps) {
    const [goalInput, setGoalInput] = useState(initialGoal.toString());
    const [isUpdating, setIsUpdating] = useState(false);

    const expectedTotal = totalStudents * initialGoal;
    const progressPercent = expectedTotal > 0
        ? Math.min((currentCollected / expectedTotal) * 100, 100)
        : 0;

    const handleUpdateGoal = async () => {
        setIsUpdating(true);
        try {
            const amount = parseFloat(goalInput);
            await api.post('/admin/settings/contribution', { amount });
            onGoalUpdate(amount);
            toast.success("Contribution goal updated!");
        } catch (error) {
            toast.error("Failed to update goal.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Card */}
            <div className="lg:col-span-2 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/10">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 opacity-60 mb-2">
                        <Target size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Collection Progress</span>
                    </div>
                    <h2 className="text-5xl font-black mt-2">₱{currentCollected.toLocaleString()}</h2>
                    <p className="mt-2 text-blue-400 font-bold uppercase text-xs tracking-wide">
                        Goal: ₱{expectedTotal.toLocaleString()} <span className="text-slate-500 mx-2">/</span> {totalStudents} Students
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-8 h-4 bg-white/10 rounded-full overflow-hidden border border-white/5 p-1">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-3">
                        <span className="text-[10px] font-black uppercase text-blue-400 italic">Targeting 100%</span>
                        <p className="text-[10px] font-black uppercase opacity-60">
                            {progressPercent.toFixed(1)}% Completed
                        </p>
                    </div>
                </div>
                {/* Background Decor */}
                <Target className="absolute -right-12 -bottom-12 text-white/5 rotate-12" size={280} />
            </div>

            {/* Setting Card (Display Only) */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 flex flex-col justify-center">

                <div className="flex items-center gap-2 mb-6 text-slate-900">
                    <Settings size={18} className="text-blue-600" />
                    <h3 className="font-black uppercase text-[10px] tracking-widest">
                        Graduation Contribution
                    </h3>
                </div>

                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Fee per Student (₱)
                </label>

                <div className="mt-2">
                    <input
                        type="number"
                        value={goalInput}
                        disabled
                        readOnly
                        className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-xl text-slate-500 cursor-not-allowed"
                        placeholder="0.00"
                    />
                </div>

                {/* NEW CALL TO ACTION BUTTON */}
                <div className="mt-4">
                    <Link
                        href="/admin/collection"
                        className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-200 hover:shadow-blue-500/20 active:scale-[0.98]"
                    >
                        Start Collecting
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

            </div>
        </div>
    );
}