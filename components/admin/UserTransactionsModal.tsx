// components/admin/UserTransactionsModal.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { X, Search, Calendar, ShieldCheck, Loader2 } from "lucide-react";

const fetcher = (url: string) => api.get(url).then(res => res.data);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

export default function UserTransactionsModal({ isOpen, onClose, userId, userName }: ModalProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isValidating } = useSWR(
    isOpen ? `/admin/transactions/user?collected_by=${userId}&search=${search}&page=${page}` : null,
    fetcher,
    { 
      keepPreviousData: true,
      // 5 minutes in milliseconds
      refreshInterval: 300000, 
      // Optional: Prevents re-fetching every time you click back into the browser window
      revalidateOnFocus: false, 
      // Optional: Prevents re-fetching when the network reconnects
      revalidateOnReconnect: false 
    }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {userName}'s Collections
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Showing total of {data?.total || 0} transactions
              </p>
              {/* Visual indicator that data is auto-refreshing */}
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" title="Auto-refreshing every 5 mins" />
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* ... Search Bar and Table remain the same ... */}
        <div className="px-8 py-4 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search Reference or Student ID..."
              className="w-full pl-12 pr-6 py-3 text-slate-800 bg-slate-100 rounded-2xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Reference Number</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student ID</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Collected By</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.data?.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-4 font-black text-blue-600 text-xs">#{t.reference_number || t.id}</td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-500">{t.student_id}</td>
                  <td className="px-8 py-4">
                    <span className="text-xs font-black text-slate-700 uppercase flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500" /> {userName}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      {new Date(t.created_at).toLocaleDateString()}  -- {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isValidating && <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>}
        </div>
      </div>
    </div>
  );
}