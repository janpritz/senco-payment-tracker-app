"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useStudentSearch } from '../hooks/use-student-search';
import { mutate } from 'swr';
import api from '@/lib/axios';
import { fixEncoding } from '@/lib/utils';
import { db } from '@/lib/db';

export const QueueRegistrationForm = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { student, results, isSearching, setStudent } = useStudentSearch(query);

    /**
     * BACKGROUND SYNC LOGIC
     * Moves items from IndexedDB to Laravel Database
     */
    const processQueueSync = useCallback(async () => {
        const pending = await db.queue_sync.toArray();
        if (pending.length === 0) return;

        console.log(`🔄 Syncing ${pending.length} pending registrations...`);

        for (const item of pending) {
            try {
                const res = await api.post('/admin/queue/register', {
                    student_id: item.student_id
                });

                if (res.status === 200 || res.status === 201) {
                    await db.queue_sync.delete(item.id!);
                    mutate('/admin/queue/status');
                }
            } catch (err: any) {
                console.error(`❌ Sync failed for ${item.student_id}:`, err.message);
                
                // If student is already in queue, just remove from local to stop retrying
                if (err.response?.status === 422) {
                    await db.queue_sync.delete(item.id!);
                }
                
                if (!navigator.onLine) break; // Stop if we lost internet
            }
        }
    }, []);

    /**
     * AUTO-SYNC HOOK (Executed on mount)
     */
    useEffect(() => {
        processQueueSync(); // Initial sync
        
        window.addEventListener('online', processQueueSync);
        const interval = setInterval(processQueueSync, 30000); // Retry every 30s

        return () => {
            window.removeEventListener('online', processQueueSync);
            clearInterval(interval);
        };
    }, [processQueueSync]);

    /**
     * INSTANT RECORDING
     */
    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;

        try {
            // 1. Instant Save to Local DB
            await db.queue_sync.add({
                student_id: student.student_id,
                full_name: student.full_name,
                college: student.college,
                timestamp: Date.now()
            });

            // 2. Instant UI reset
            setQuery('');
            setStudent(null);

            // 3. Trigger Background Sync & Refresh Table
            processQueueSync();
            mutate('/admin/queue/status');

        } catch (err) {
            console.error("Local save failed", err);
            alert("Could not save student locally.");
        }
    };

    // Handle Dropdown Clicks
    const handleSelectStudent = (selected: any) => {
        setStudent(selected);
        setQuery(selected.full_name);
        setShowDropdown(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="w-full bg-white border-b sticky top-0 z-10 p-4 shadow-sm">
            <form onSubmit={handleCheckIn} className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 items-end">
                
                <div className="flex-1 w-full relative" ref={dropdownRef}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Search Masterlist
                    </label>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="ID Number or Name..."
                        className="w-full text-slate-700 p-3 bg-slate-50 border rounded-lg outline-orange-500 transition-all"
                        required
                    />

                    {showDropdown && query.length >= 2 && results && results.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                            {results.map((res: any) => (
                                <button
                                    key={res.student_id}
                                    type="button"
                                    onClick={() => handleSelectStudent(res)}
                                    className="w-full text-left p-3 hover:bg-orange-50 border-b border-slate-50 last:border-0 transition-colors flex flex-col"
                                >
                                    <span className="font-bold text-slate-800 text-sm">{fixEncoding(res.full_name)}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{res.student_id} — {res.college}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-[2] w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded-lg bg-slate-50 min-h-[66px]">
                    <div className="flex flex-col justify-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Selected Student</span>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                            {isSearching ? 'Searching...' : (student?.full_name || '---')}
                        </p>
                    </div>
                    <div className="flex flex-col justify-center border-l md:pl-4 border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">College</span>
                        <p className="text-sm font-semibold text-slate-800">
                            {student?.college || '---'}
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !student || isSearching}
                    className="w-full lg:w-auto px-10 h-[50px] bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all"
                >
                    ADD TO QUEUE
                </button>
            </form>
        </div>
    );
};