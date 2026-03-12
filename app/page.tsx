"use client";

import { useState, useRef } from "react";
import { PaymentRecord } from "@/types/payment";
import { fetchStudentRecords } from "@/services/payment";
import { StatusBadge } from "@/components/statusBadge";
import { DetailRow } from "@/components/detailRow";
import { PaymentTable } from "@/components/paymentTable";
import { formatDate } from "@/utils/formatDate";

export default function Home() {
  const [studentId, setStudentId] = useState("");
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Expert Throttle: Tracks the timestamp of the last successful search
  // useRef doesn't trigger a re-render, making it highly efficient for logic gates.
  const lastSearchTime = useRef<number>(0);
  const THROTTLE_LIMIT = 3000; // 5 seconds cooldown

  const latest = history[0];

  const handleSearch = async () => {
    const now = Date.now();

    // 1. Guard: Check for cooldown
    if (now - lastSearchTime.current < THROTTLE_LIMIT) {
      console.warn("Too many requests. Please wait.");
      return;
    }

    // 2. Guard: Basic validation & existing loading state
    if (!studentId.trim() || loading) return;

    // Update the ref immediately to block subsequent clicks
    lastSearchTime.current = now;
    
    setLoading(true);
    setSearched(true);

    try {
      const results = await fetchStudentRecords(studentId);
      setHistory(results);
    } catch (err) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-start justify-center p-4 pt-12">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden">
        <div className="bg-blue-800 p-6 text-white text-center">
          <h1 className="text-lg font-bold tracking-widest uppercase">
            Senco Payment Tracker
          </h1>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-8">
            <input
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-800 transition"
              placeholder="Enter Student ID..."
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-800 text-white px-6 rounded-xl font-medium hover:opacity-90 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Find"}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Searching database...</div>
          ) : latest ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xs font-black text-gray-600 uppercase mb-4 tracking-wider">
                Student Profile
              </h2>
              
              <div className="space-y-1 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-6">
                <DetailRow label="Full Name" value={latest.Name} />
                <DetailRow label="Current Balance" value={`${latest.Balance}`} />
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-500 text-sm">Status</span>
                  <StatusBadge status={latest.Status} />
                </div>
                <DetailRow
                  label="Last Payment"
                  value={formatDate(latest["Last Payment"])}
                />
              </div>

              <h2 className="text-xs font-black text-gray-600 uppercase mt-8 mb-2 tracking-wider">
                Payment History
              </h2>
              <PaymentTable history={history} />
            </div>
          ) : searched && (
            <div className="text-center py-12 bg-red-50 rounded-2xl text-red-500 font-medium">
              No records found for this ID.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}