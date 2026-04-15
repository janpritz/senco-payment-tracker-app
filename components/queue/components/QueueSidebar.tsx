"use client";

import { History, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fixEncoding } from "@/lib/utils";

interface Student {
  id: string | number;
  name: string;
  student_id: string;
}

export const QueueSidebar = ({ upcoming }: { upcoming?: Student[] }) => {
  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Up Next Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Up Next</h3>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {upcoming && upcoming.length > 0 ? (
              upcoming.slice(0, 5).map((student, idx) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl"
                >
                  <span className="text-xs font-black text-slate-300">0{idx + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{fixEncoding(student.name)}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{student.student_id}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center py-8 text-xs font-bold text-slate-300 uppercase tracking-widest">
                Queue Empty
              </p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tip Card */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-purple-400" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Tip</p>
        </div>
        <p className="text-xs leading-relaxed text-slate-300">
          Verify student ID before clicking <span className="text-white font-bold">Next</span>. This ensures the correct name appears on the studio TV display.
        </p>
      </div>
    </div>
  );
};