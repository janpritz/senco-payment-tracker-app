"use client";

import { useState, useEffect } from 'react';
import { QueueRegistrationForm } from "@/components/queue/components/queue-registration-form";
import { StudentQueueTable } from "@/components/queue/components/student-queue-table";
import { useMasterlistSync } from '@/components/queue/hooks/use-student-search';
import { useAdminLogin } from '@/hooks/useAdminLogin';
import { db } from '@/lib/db';

export default function RegistrationPage() {
  const { isSyncing, syncMasterlist } = useMasterlistSync();

  const [studentCount, setStudentCount] = useState(0);

  const handleSync = async () => {
    await syncMasterlist();
    setStudentCount(await db.students.count());
  };

  // Destructure state and actions from your custom hook
  const { state, actions } = useAdminLogin();
  const { user } = state;
  const { handleLogout } = actions;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* 1. TOP HEADER NAVIGATION */}
      <header className="w-full bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 leading-tight">
              GRADUATION <span className="text-orange-600">PICTORIAL</span>
            </h1>
            <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">
              Student Attendance & Queue Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           {/* Student Count & Refresh Masterlist */}
           <div className="flex items-center gap-4">
             <div className="text-sm text-slate-600 font-medium">
               Students: {studentCount}
             </div>
             <button
               type="button"
               onClick={handleSync}
               disabled={isSyncing}
               className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1 hover:text-orange-700 disabled:opacity-50 transition-colors"
             >
               {isSyncing ? 'Syncing...' : '↻ Refresh Masterlist'}
             </button>
           </div>

           {/* User Info & Logout */}
           <div className="flex items-center gap-3 border-l pl-6">
            <div className="text-right hidden sm:block">
               <p className="text-[10px] font-bold text-slate-400 uppercase">Logged in as</p>
               <p className="text-xs font-black text-slate-700">{user?.name || 'Administrator'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2 text-xs bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-full font-bold transition-all border border-slate-200"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {/* 2. REGISTRATION BAR (STICKY) */}
      <div className="w-full sticky top-0 z-10 shadow-md">
        <QueueRegistrationForm />
      </div>

      {/* 3. MAIN CONTENT */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 lg:p-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-800">Current Queue List</h2>
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <span className="bg-orange-100 text-orange-700 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tight">
              Live Updates Enabled
            </span>
          </div>

          <div className="p-0 overflow-x-auto">
            <StudentQueueTable />
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="w-full py-6 border-t border-slate-200 bg-white">
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Senco Payment Tracker Integration v2.0 • Abuyog Community College
        </p>
      </footer>
    </div>
  );
}