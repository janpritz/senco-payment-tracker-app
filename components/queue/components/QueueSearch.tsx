"use client";

import { useState, useMemo } from 'react';
import { Search, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fixEncoding } from '@/lib/utils';

interface Student {
    id: string | number;
    name: string;
    student_id: string;
}

interface QueueSearchProps {
    upcoming: Student[];
    onPrioritize: (id: string | number) => void;
}

export const QueueSearch = ({ upcoming, onPrioritize }: QueueSearchProps) => {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const results = useMemo(() => {
        if (!query.trim()) return [];
        return upcoming.filter(s => 
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.student_id.includes(query)
        ).slice(0, 5);
    }, [query, upcoming]);

    return (
        <div className="p-6 bg-slate-50 border-b border-slate-100 relative">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text"
                    placeholder="Search student to prioritize..."
                    className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click
                />
                {query && (
                    <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isFocused && query && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-6 right-6 top-[85px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {results.length > 0 ? (
                            results.map((student) => (
                                <button
                                    key={student.id}
                                    onClick={() => {
                                        onPrioritize(student.id);
                                        setQuery("");
                                    }}
                                    className="w-full flex items-center justify-between p-4 hover:bg-purple-50 transition-colors border-b border-slate-50 last:border-0 group"
                                >
                                    <div className="text-left">
                                        <p className="text-sm font-black text-slate-800">{fixEncoding(student.name)}</p>
                                        <p className="text-[10px] font-mono text-slate-400">{student.student_id}</p>
                                    </div>
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))
                        ) : (
                            <div className="p-6 text-center text-xs font-bold text-slate-400">NO STUDENT FOUND</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};