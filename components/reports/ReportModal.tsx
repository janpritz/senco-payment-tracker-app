"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import api from "@/lib/axios";
import { X, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [narrative, setNarrative] = useState({
    summary: "",
    issues: "",
    resolutions: ""
  });

  // 1. Automatically fetch today's stats from IndexDB
  const stats = useLiveQuery(async () => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());
    const todayPayments = await db.payments.where('date').equals(today).toArray();
    
    return {
      total: todayPayments.reduce((sum, p) => sum + Number(p.amount), 0),
      count: todayPayments.length
    };
  }, []);

  const handleSave = async () => {
    if (!narrative.summary) return toast.error("Please provide a summary");
    
    setIsSubmitting(true);
    try {
      await api.post('/admin/reports', {
        ...narrative,
        total_collected: stats?.total || 0,
        transaction_count: stats?.count || 0
      });
      toast.success("Daily Narrative Synced!");
      onClose();
    } catch (error) {
      toast.error("Sync failed. Check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
        
        <div className="p-10">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Daily Narrative</h2>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded-full uppercase">
                   ₱{stats?.total.toLocaleString()} Collected
                </span>
                <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-full uppercase">
                   {stats?.count} Total Transactions
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 text-slate-600 rounded-full transition-all"><X /></button>
          </header>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Collection Summary</label>
              <textarea 
                className="w-full mt-2 p-5 bg-slate-50 rounded-3xl border-none font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none h-32"
                placeholder="How was the collection flow today?"
                value={narrative.summary}
                onChange={(e) => setNarrative({...narrative, summary: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-red-400 ml-1 flex items-center gap-1">
                  <AlertCircle size={12}/> Issues
                </label>
                <textarea 
                  className="w-full mt-2 p-5 bg-red-50/30 rounded-3xl border-none text-sm outline-red-200 text-red-600 h-28"
                  placeholder="Problems occured..."
                  value={narrative.issues}
                  onChange={(e) => setNarrative({...narrative, issues: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-emerald-500 ml-1 flex items-center gap-1">
                  <CheckCircle size={12}/> Resolutions
                </label>
                <textarea 
                  className="w-full mt-2 p-5 bg-emerald-50/30 rounded-3xl border-none text-sm outline-green-300 text-green-600 h-28"
                  placeholder="Actions taken..."
                  value={narrative.resolutions}
                  onChange={(e) => setNarrative({...narrative, resolutions: e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <FileText size={18} />}
              Submit Narrative Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}