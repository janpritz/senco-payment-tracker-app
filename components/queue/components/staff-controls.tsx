"use client";

import { useQueueActions } from '../hooks/use-queue-actions';
import { Undo2, CheckCircle2, UserPlus, GraduationCap, Sparkles, ArrowRightLeft, Users } from 'lucide-react';
import { fixEncoding } from "@/lib/utils";

// Define an interface to prevent future type errors
interface Student {
    id: string | number;
    student_id: string;
    name: string;
    status?: string;
    updated_at?: string;
}

export const StaffControls = () => {
    const { triggerAction, queueData } = useQueueActions();

    // 1. Creative logic: Filter for 'creative' status and take the most recent
    const creativeStudent = queueData?.active_sessions
        ?.filter((s: Student) => s.status === 'creative')
        ?.sort((a: Student, b: Student) => 
            new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        )[0] as Student | undefined;

    // 2. FIXED: Accessing the single object directly from backend source
    const togaActive = (queueData?.toga_active as unknown) as Student | undefined;

    const upcomingStudents: Student[] = queueData?.upcoming || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">
                            Studio Control
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage booth flow efficiently
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-xl border">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">
                            {queueData?.total_waiting || 0} waiting
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* CREATIVE STATION */}
                    <div className="space-y-4">
                        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-xl">
                                        <Sparkles className="text-orange-600 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Station 01</p>
                                        <h2 className="text-lg font-bold text-slate-800">Creative Shot</h2>
                                    </div>
                                </div>

                                <button
                                    onClick={() => triggerAction('undo_creative')}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                                    title="Undo last call"
                                >
                                    <Undo2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="bg-slate-900 rounded-2xl p-5 text-white">
                                <p className="text-xs text-orange-400 mb-1">Live in Booth</p>
                                <p className="text-xl font-bold truncate">
                                    {creativeStudent
                                        ? fixEncoding(creativeStudent.name)
                                        : "Ready for next student"}
                                </p>
                                {creativeStudent && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        {creativeStudent.student_id}
                                    </p>
                                )}
                            </div>

                            <button
                                disabled={!creativeStudent && upcomingStudents.length === 0}
                                onClick={() => triggerAction('next_creative')}
                                className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white transition disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                {creativeStudent ? (
                                    <>
                                        <ArrowRightLeft className="w-4 h-4" />
                                        Move to Toga
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Call Next
                                    </>
                                )}
                            </button>
                        </div>

                        {/* UPCOMING QUEUE */}
                        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border">
                            <p className="text-xs text-slate-400 mb-3">Upcoming Queue</p>
                            <div className="space-y-2 max-h-56 overflow-y-auto">
                                {upcomingStudents.length > 0 ? (
                                    upcomingStudents.map((student, i) => (
                                        <div
                                            key={student.id}
                                            className="flex justify-between items-center p-3 rounded-lg hover:bg-orange-50 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {fixEncoding(student.name)}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-400">{student.student_id}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-xs text-slate-400 py-4">No students in queue</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* TOGA STATION */}
                    <div className="space-y-4">
                        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <GraduationCap className="text-purple-600 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Station 02</p>
                                        <h2 className="text-lg font-bold text-slate-800">Toga Session</h2>
                                    </div>
                                </div>

                                <button
                                    onClick={() => triggerAction('undo_toga')}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                                >
                                    <Undo2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="bg-purple-900 rounded-2xl p-5 text-white">
                                <p className="text-xs text-purple-300 mb-1">In Toga Booth</p>
                                <p className="text-xl font-bold truncate">
                                    {togaActive
                                        ? fixEncoding(togaActive.name)
                                        : "Waiting for transfer"}
                                </p>
                                {togaActive && (
                                    <p className="text-xs text-purple-300 mt-1">
                                        {togaActive.student_id}
                                    </p>
                                )}
                            </div>

                            <button
                                disabled={!togaActive}
                                onClick={() => triggerAction('next_toga')}
                                className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white transition disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Complete Session
                            </button>
                        </div>

                        {/* TOGA QUEUE */}
                        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border">
                            <p className="text-xs text-slate-400 mb-3">Toga Queue (Waiting)</p>
                            <div className="space-y-2 max-h-56 overflow-y-auto">
                                {queueData?.toga_queue?.length > 0 ? (
                                    queueData.toga_queue.map((student: Student, i: number) => (
                                        <div
                                            key={student.id}
                                            className="flex justify-between items-center p-3 rounded-lg hover:bg-purple-50 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {fixEncoding(student.name)}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-400">{student.student_id}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-xs text-slate-400 py-4">No students waiting</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RECENTLY COMPLETED */}
                    <div className="space-y-4">
                        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border">
                            <p className="text-xs text-slate-400 mb-4">Recently Completed</p>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {queueData?.recent_completed?.length > 0 ? (
                                    queueData.recent_completed.map((student: Student) => (
                                        <div
                                            key={student.id}
                                            className="flex justify-between items-center p-3 rounded-lg hover:bg-green-50 transition border border-transparent hover:border-green-100"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {fixEncoding(student.name)}
                                                </span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                                    {student.student_id}
                                                </span>
                                            </div>
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-xs text-slate-400 py-4">No completed sessions</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};