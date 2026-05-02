"use client";

import { useState, useEffect, useRef } from "react";
import { Search, CheckCircle, X, User } from "lucide-react";
import api from "@/lib/axios";
import { db } from "@/lib/db";

export default function ClaimModal({
    isOpen,
    onClose,
    onClaimSuccess
}: any) {

    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [selected, setSelected] = useState<any | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [studentMap, setStudentMap] = useState<Map<string, string>>(new Map());

    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const activeSearchRef = useRef(0);

    // Load students on mount for quick ID-to-name resolution during search
    useEffect(() => {
        if (!isOpen) return;

        const loadStudents = async () => {
            const students = await db.students.toArray();

            const map = new Map(
                students.map(s => [s.student_id, s.full_name])
            );

            setStudentMap(map);
        };

        loadStudents();
    }, [isOpen]);

    // Auto focus
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Click outside dropdown
    useEffect(() => {
        const handler = (e: any) => {
            if (!wrapperRef.current?.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Search
    useEffect(() => {
        if (!isOpen) return;

        const timeout = setTimeout(async () => {
            if (search.length < 2) {
                setSuggestions([]);
                setShowDropdown(false);
                if (!search) setSelected(null);
                return;
            }

            if (studentMap.size === 0) return; // 🔒 ensure map is ready

            const id = ++activeSearchRef.current;
            setLoading(true);

            try {
                const lowerSearch = search.toLowerCase();

                const claims = await db.receipt_claims
                    .filter((item: any) => {
                        const sid = item.student_id || "";
                        const name = studentMap.get(sid)?.toLowerCase() || "";

                        return (
                            sid.toLowerCase().includes(lowerSearch) ||
                            name.includes(lowerSearch)
                        );
                    })
                    .limit(5)
                    .toArray();

                if (id !== activeSearchRef.current) return;

                const enriched = claims.map((claim: any) => ({
                    ...claim,
                    full_name: studentMap.get(claim.student_id) || "Unknown Student"
                }));

                setSuggestions(enriched);
                setShowDropdown(true);
                setActiveIndex(-1);

            } catch (err) {
                console.error(err);
            } finally {
                if (id === activeSearchRef.current) setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, isOpen, studentMap]);

    const handleSelect = async (item: any) => {
        const student = await db.students
            .where("student_id")
            .equals(item.student_id)
            .first();

        const enriched = {
            ...item,
            full_name: student?.full_name || "Unknown Student"
        };

        setSelected(enriched);
        setSearch(enriched.full_name);
        setShowDropdown(false);
    };

    const handleClaim = async () => {
        if (!selected || selected.is_claimed || claiming) return;

        setClaiming(true);
        try {
            await api.post(`/admin/receipts/${selected.id}/claim`);

            const updated = { ...selected, is_claimed: true };
            setSelected(updated);

            await db.receipt_claims.update(selected.id, { is_claimed: true });

            onClaimSuccess();
        } catch {
            alert("Claim failed");
        } finally {
            setClaiming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, 0));
        }

        if (e.key === "Enter" && suggestions[activeIndex]) {
            handleSelect(suggestions[activeIndex]);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setSearch("");
            setSelected(null);
            setSuggestions([]);
            setShowDropdown(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md">

            <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row border border-white/20 animate-in fade-in zoom-in duration-300">

                {/* LEFT SIDE */}
                <div className="flex-[1.5] p-12 border-r border-slate-100 overflow-y-auto bg-white">

                    <header className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                                Claim Receipt
                            </h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Verification System
                            </p>
                        </div>
                        <button onClick={onClose} className="md:hidden text-slate-400 p-2 hover:bg-slate-100 rounded-full">
                            <X size={28} />
                        </button>
                    </header>

                    {/* SEARCH */}
                    <div ref={wrapperRef} className="relative">
                        <input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search name or student ID..."
                            className="w-full px-5 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                        />

                        {/* DROPDOWN */}
                        {showDropdown && (
                            <div className="absolute w-full mt-3 bg-white border rounded-2xl shadow-xl z-20 max-h-80 overflow-y-auto">

                                {loading && (
                                    <div className="p-4 text-sm text-slate-400 text-center">
                                        Searching...
                                    </div>
                                )}

                                {suggestions.map((item, i) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelect(item)}
                                        className={`w-full text-left px-5 py-4 flex gap-4 ${i === activeIndex ? "bg-blue-50" : "hover:bg-slate-50"
                                            }`}
                                    >
                                        <User size={18} className="text-blue-500" />
                                        <div>
                                            <div className="font-bold text-slate-800">
                                                {item.full_name}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {item.student_id}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="w-full md:w-[400px] bg-slate-50 p-12 flex flex-col relative">

                    <button onClick={onClose} className="hidden md:block absolute top-10 right-10 text-slate-300 hover:text-slate-900">
                        <X size={24} />
                    </button>

                    {!selected ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                            Select a student
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                                    Student Info
                                </h4>
                                <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border">

                                {/* Filing ID */}
                                <p className="text-md font-black text-blue-600 tracking-[0.2em] uppercase mb-2">
                                    Filing ID: {selected.id?.toString().padStart(4, "0")}
                                </p>

                                {/* Name */}
                                <h3 className="text-xl font-black text-slate-900">
                                    {selected.full_name}
                                </h3>

                                {/* Student ID */}
                                <p className="text-sm text-slate-400 mt-1">
                                    {selected.student_id}
                                </p>

                                {/* Status / Action */}
                                {selected.is_claimed ? (
                                    <div className="mt-6 text-emerald-600 font-bold flex gap-2 items-center">
                                        <CheckCircle size={16} /> Claimed
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleClaim}
                                        disabled={claiming}
                                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                                    >
                                        {claiming ? "Processing..." : "Confirm Claim"}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}