"use client";

import { useState, useRef } from "react";
import { StudentPayment } from "@/types/payment";
import { fetchStudentRecords } from "@/services/payment";
import { StatusBadge } from "@/components/statusBadge";
import { DetailRow } from "@/components/detailRow";
import { PaymentTable } from "@/components/paymentTable";
import { formatCurrency } from "@/utils/formatters";

export default function Home() {
  const [studentId, setStudentId] = useState("");
  const [portalCode, setPortalCode] = useState("");
  const [showCode, setShowCode] = useState(false);

  const [studentData, setStudentData] = useState<StudentPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastSearchTime = useRef<number>(0);
  const THROTTLE_LIMIT = 2000;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const now = Date.now();
    if (now - lastSearchTime.current < THROTTLE_LIMIT) return;
    if (!studentId.trim() || !portalCode.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const results = await fetchStudentRecords(studentId, portalCode);
      setStudentData(results);
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setStudentData(null);
    setStudentId("");
    setPortalCode("");
    setShowCode(false);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-white">

        <div className="bg-blue-800 p-5 text-white text-center">
          <h1 className="text-xl font-bold tracking-tight">Senco Student Portal</h1>
          <p className="text-blue-200 text-[10px] mt-1 uppercase tracking-widest font-medium">
            Payment Tracking System
          </p>
        </div>

        <div className="p-8">
          {!studentData ? (
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in zoom-in-95 duration-300">

              {/* Student ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Student ID</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all"
                  placeholder="2022-01-XXXXX"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>

              {/* Portal Code with Dynamic Eye Color */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Portal Code</label>
                <div className="relative">
                  <input
                    type={showCode ? "text" : "password"}
                    className="w-full bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all"
                    placeholder="••••••••"
                    value={portalCode}
                    onChange={(e) => setPortalCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    disabled={portalCode.length === 0}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${portalCode.length > 0 ? "text-blue-800" : "text-gray-300 cursor-default"
                      }`}
                  >
                    {showCode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-[11px] font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100 animate-in shake duration-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-800 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-800/20 hover:bg-blue-900 active:scale-[0.98] transition-all disabled:bg-gray-300 mt-4"
              >
                {loading ? "Verifying Access..." : "Sign In"}
              </button>
            </form>
          ) : (
            /* DASHBOARD VIEW (Logged In) */
            <div className="animate-in slide-in-from-bottom-8 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-black text-gray-600 uppercase tracking-wider">
                  Account Overview
                </h2>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-bold text-blue-800 hover:underline"
                >
                  Logout
                </button>
              </div>
              <div className="space-y-1 bg-blue-50/50 p-5 rounded-[2rem] border border-blue-100/50 mb-8">
                <DetailRow label="Student Name" value={studentData.name} />
                <DetailRow label="Remaining Balance" value={formatCurrency(studentData.balance)} />
                <div className="flex justify-between items-center py-3 border-b border-blue-100/30 last:border-0">
                  <span className="text-gray-500 text-sm">Payment Status</span>
                  <StatusBadge status={studentData.status} />
                </div>
              </div>
              <h2 className="text-xs font-black text-gray-600 uppercase mb-4 tracking-wider">
                Payment History
              </h2>
              <PaymentTable history={studentData.history || []} />
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">
                  © {new Date().getFullYear()} SENCO Payment Tracker
                  <br />
                  <span className="text-[9px] opacity-70">Abuyog Community College - SENCO FINANCE COMMITTEE</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
