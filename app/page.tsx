"use client";

import { useState, useRef } from "react";
import { StudentPayment } from "@/types/payment";
import { fetchStudentRecords } from "@/services/payment";
import { StatusBadge } from "@/components/statusBadge";
import { DetailRow } from "@/components/detailRow";
import { PaymentTable } from "@/components/paymentTable";
import { formatCurrency } from "@/utils/formatters";

export default function Home() {
  // Login States
  const [studentId, setStudentId] = useState("");
  const [portalCode, setPortalCode] = useState("");

  // Data States
  const [studentData, setStudentData] = useState<StudentPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security Throttle
  const lastSearchTime = useRef<number>(0);
  const THROTTLE_LIMIT = 2000;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const now = Date.now();
    if (now - lastSearchTime.current < THROTTLE_LIMIT) return;
    if (!studentId.trim() || !portalCode.trim() || loading) return;

    lastSearchTime.current = now;
    setLoading(true);
    setError(null);

    try {
      // Note: fetchStudentRecords must be updated to accept (id, code)
      const results = await fetchStudentRecords(studentId, portalCode);
      setStudentData(results);
    } catch (err: any) {
      setStudentData(null);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setStudentData(null);
    setStudentId("");
    setPortalCode("");
    setError(null);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-white">

        {/* Header Section */}
        <div className="bg-blue-800 p-8 text-white text-center">
          <h1 className="text-xl font-bold tracking-tight">
            Senco Student Portal
          </h1>
          <p className="text-blue-200 text-xs mt-1 uppercase tracking-widest font-medium">
            Payment Tracking System
          </p>
        </div>

        <div className="p-8">
          {!studentData ? (
            /* LOGIN VIEW */
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
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

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Code</label>
                <input
                  type="password"
                  className="w-full bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all"
                  placeholder="••••••••"
                  value={portalCode}
                  onChange={(e) => setPortalCode(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-800 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-800/20 hover:bg-blue-900 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:shadow-none mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : "Sign In"}
              </button>

              <p className="text-center text-[10px] text-gray-400 mt-6">
                Official Student Payment History Portal for 2026 Graduation Contribution
              </p>
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
                  <span className="text-gray-500 text-xs">Payment Status</span>
                  <StatusBadge status={studentData.status} />
                </div>
              </div>

              <h2 className="text-xs font-black text-gray-600 uppercase mb-4 tracking-wider">
                Payment History
              </h2>
              <PaymentTable history={studentData.history || []} />

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">
                  © {new Date().getFullYear()} SENCO Payment Tracker. All Rights Reserved.
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