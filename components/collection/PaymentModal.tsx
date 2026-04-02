"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { X, Search, User, School, History, CheckCircle2, Loader2, ChevronRight } from "lucide-react";

// 1. Interface
interface StudentData {
    student_id: string;
    full_name: string;
    college: string;
    course: string;
    balance: number;
    payment_history: string | null;
}

// 2. Fetcher helper
const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function PaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    // --- Hooks ---
    const { data: masterlist, isLoading } = useSWR<StudentData[]>('/api/admin/masterlist', fetcher, {
        revalidateOnFocus: false,
    });

    const [query, setQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
    const [amount, setAmount] = useState("");
    const [searchError, setSearchError] = useState("");

    // Slider State
    const [sliderPos, setSliderPos] = useState(0);
    const [isSwiped, setIsSwiped] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 3. Updated College Color Coding
    const getCollegeColor = (college: string) => {
        const c = college?.toUpperCase() || "";
        if (c.includes("CITE")) return "bg-emerald-600"; // Green
        if (c.includes("CASE")) return "bg-blue-600";    // Blue
        if (c.includes("CCJE")) return "bg-red-600";     // Red
        if (c.includes("COHME")) return "bg-orange-500"; // Orange
        return "bg-slate-900"; // Default Fallback
    };

    // 4. Search Function (Enter to Search)
    const handleSearch = () => {
        const cleanQuery = query.trim().toLowerCase();
        setSearchError("");

        if (!cleanQuery) {
            setSelectedStudent(null);
            return;
        }

        if (!masterlist) {
            setSearchError("Database syncing... please wait.");
            return;
        }

        const found = masterlist.find(s => {
            const studentId = s?.student_id?.toString().toLowerCase() ?? "";
            const fullName = s?.full_name?.toLowerCase() ?? "";
            return studentId === cleanQuery || fullName.includes(cleanQuery);
        });

        if (found) {
            setSelectedStudent({
                ...found,
                balance: Number(found.balance ?? 0)
            });
            setSearchError("");
        } else {
            setSelectedStudent(null);
            setSearchError("Student not found.");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    // --- Drag Logic ---
    const startDrag = () => { if (!isSwiped && selectedStudent) setIsDragging(true); };
    const stopDrag = () => { if (!isSwiped) { setIsDragging(false); setSliderPos(0); } };

    const onDrag = (e: any) => {
        if (!isDragging || isSwiped || !containerRef.current) return;
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const rect = containerRef.current.getBoundingClientRect();
        const moveX = clientX - rect.left - 24;
        const maxMove = rect.width - 64;
        const newPos = Math.max(0, Math.min(moveX, maxMove));
        setSliderPos(newPos);

        if (newPos >= maxMove - 5) {
            setIsSwiped(true);
            setIsDragging(false);
            setSliderPos(maxMove);
            // Handle Payment Logic Here
            console.log("Processing payment for:", selectedStudent?.full_name, "Amount:", amount);
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onDrag);
            window.addEventListener('mouseup', stopDrag);
            window.addEventListener('touchmove', onDrag);
            window.addEventListener('touchend', stopDrag);
        }
        return () => {
            window.removeEventListener('mousemove', onDrag);
            window.removeEventListener('mouseup', stopDrag);
            window.removeEventListener('touchmove', onDrag);
            window.removeEventListener('touchend', stopDrag);
        };
    }, [isDragging]);

    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setSelectedStudent(null);
            setAmount("");
            setSliderPos(0);
            setIsSwiped(false);
            setSearchError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            {/* Hides the number input up/down buttons */}
            <style jsx global>{`
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            `}</style>

            <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                <div className="flex-1 p-8 border-r border-slate-50 overflow-y-auto">
                    <header className="flex justify-between items-center mb-1">
                        <h2 className="text-l font-black text-slate-900 uppercase tracking-tight">Record Payment</h2>
                        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-900"><X size={24} /></button>
                    </header>

                    <div className="space-y-6">
                        {/* Search Input */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Student Lookup</label>
                            <div className="relative mt-2">
                                <Search 
                                    className={`absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer ${isLoading ? 'text-emerald-500 animate-pulse' : 'text-slate-400 hover:text-emerald-600'}`} 
                                    size={20} 
                                    onClick={handleSearch}
                                />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold outline-none text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                                    placeholder="Enter ID and press Enter..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" size={18} />}
                            </div>
                            {searchError && <p className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1">{searchError}</p>}
                        </div>

                        {/* Result View */}
                        {selectedStudent && (
                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                                <div className={`p-4 rounded-[10px] text-white shadow-xl transition-all duration-500 ${getCollegeColor(selectedStudent.college)}`}>
                                    <div className="flex items-center gap-2 mb-2 opacity-60">
                                        <School size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{selectedStudent.college}</span>
                                    </div>
                                    <h3 className="font-black leading-tight mb-1 truncate">{selectedStudent.full_name}</h3>
                                    <p className="opacity-90 text-xs font-bold uppercase tracking-wider">{selectedStudent.course}</p>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Payment Amount (₱)</label>
                                    <input
                                        type="number"
                                        className="w-full mt-2 px-6 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black text-3xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>

                                {/* Slider Component */}
                                <div className="relative mt-8">
                                    <div ref={containerRef} className="h-16 bg-slate-100 rounded-2xl relative flex items-center justify-center overflow-hidden border border-slate-200 select-none">
                                        <p className={`text-[10px] font-black text-slate-700 uppercase tracking-widest transition-opacity ${sliderPos > 50 ? 'opacity-0' : 'opacity-40'}`}>
                                            {isSwiped ? "PAYMENT CONFIRMED" : "Slide to Confirm Payment"}
                                        </p>
                                        <div
                                            onMouseDown={startDrag}
                                            onTouchStart={startDrag}
                                            className={`absolute left-2 h-12 w-12 rounded-xl flex items-center justify-center shadow-lg z-10 cursor-grab ${isSwiped ? 'bg-emerald-500' : 'bg-slate-900'} text-white`}
                                            style={{ transform: `translateX(${sliderPos}px)`, transition: isDragging ? 'none' : 'transform 0.3s' }}
                                        >
                                            {isSwiped ? <CheckCircle2 size={20} /> : <ChevronRight size={20} />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-80 bg-slate-50 p-10 flex flex-col relative">
                    <button onClick={onClose} className="hidden md:block absolute top-6 right-6 text-slate-300 hover:text-slate-900"><X size={20} /></button>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><History size={14} /> Account Status</h4>
                    {selectedStudent ? (
                        <div className="space-y-8 animate-in fade-in">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Graduation Balance</span>
                                <p className="text-4xl font-black text-slate-900 mt-1">
                                    ₱{(selectedStudent.balance ?? 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center opacity-30 text-center">
                            <User size={48} className="mb-4 text-slate-400" />
                            <p className="text-[10px] font-black uppercase text-slate-500">Search student<br/>to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}