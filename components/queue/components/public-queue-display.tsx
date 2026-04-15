"use client";

import { useQueueActions } from '../hooks/use-queue-actions';
import { Clock, Camera, Sparkles, GraduationCap, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { fixEncoding } from '@/lib/utils';

export const PublicQueueDisplay = () => {
    const { queueData, isLoading } = useQueueActions();

    // Creative queue sorted by oldest (First station)
    const creativeSessions = queueData?.active_sessions
        ?.filter((s: any) => s.status === 'creative')
        ?.sort((a: any, b: any) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) || [];

    // Toga queue sorted by oldest (Second station)
    const togaSessions = queueData?.active_sessions
        ?.filter((s: any) => s.status === 'toga')
        ?.sort((a: any, b: any) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) || [];

    if (isLoading) {
        return (
            <div className="h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#F1F5F9] flex flex-col overflow-hidden font-sans text-slate-900">
            <main className="flex-1 flex w-full overflow-hidden p-6 gap-6">
                
                {/* 1. CREATIVE SECTION (LEFT - START) */}
                <BoothSection
                    title="1. Creative Booth"
                    current={creativeSessions[0]}
                    queue={creativeSessions.slice(1)}
                    theme="orange"
                    icon={<Sparkles className="w-8 h-8 text-white" />}
                />

                {/* 2. TOGA SECTION (MIDDLE - FINISH) */}
                <BoothSection
                    title="2. Toga Booth"
                    current={togaSessions[0]}
                    queue={togaSessions.slice(1)}
                    theme="purple"
                    icon={<GraduationCap className="w-8 h-8 text-white" />}
                />

                {/* SIDEBAR: GLOBAL WAITING */}
                <aside className="w-[22%] flex flex-col gap-4">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Up Next</h3>
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                                {queueData?.total_waiting || 0}
                            </span>
                        </div>

                        <div className="space-y-3 overflow-hidden">
                            <AnimatePresence>
                                {queueData?.upcoming?.slice(0, 7).map((student: any, i: number) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                        key={student.id}
                                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4"
                                    >
                                        <span className="text-sm font-black text-slate-300">{i + 1}</span>
                                        <p className="text-sm font-bold truncate text-slate-700">{fixEncoding(student.name)}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase text-slate-900 tracking-tighter">
                                Please ensure your attendance is recorded at registration before proceeding to the booths.
                            </p>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

const BoothSection = ({ title, current, queue, theme, icon }: any) => {
    const isPurple = theme === 'purple';
    const accentColor = isPurple ? 'bg-purple-600' : 'bg-orange-500';
    const lightAccent = isPurple ? 'bg-purple-50' : 'bg-orange-50';
    const textAccent = isPurple ? 'text-purple-600' : 'text-orange-600';

    return (
        <section className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative">
            <div className={`${accentColor} p-6 flex items-center gap-4 shadow-md`}>
                <div className="p-2 bg-white/20 rounded-xl">{icon}</div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{title}</h2>
            </div>

            <div className="flex-1 flex flex-col p-10">
                <div className="flex-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${lightAccent} ${textAccent}`}>
                        Now Serving
                    </span>

                    <AnimatePresence mode="wait">
                        {current ? (
                            <motion.div
                                key={current.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <h2 className="text-[4vw] font-black leading-none tracking-tight text-slate-900 uppercase">
                                    {fixEncoding(current.name)}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-mono font-bold text-slate-400">ID: {current.student_id}</span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-3xl font-black text-slate-200 uppercase italic">Waiting for Student</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {queue.length > 0 && (
                    <div className="mt-auto pt-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-4 h-4 text-slate-600" />
                            <p className="text-xs font-black text-slate-600 uppercase tracking-[0.2em]">
                                Waiting List ({queue.length})
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {queue.map((student: any) => (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                                    key={student.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                                >
                                    <p className="text-md font-bold text-slate-900">
                                        {fixEncoding(student.name)}
                                    </p>
                                    <ArrowRight className="w-4 h-4 text-slate-300" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};