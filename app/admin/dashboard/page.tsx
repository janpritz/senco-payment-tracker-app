"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { TrendingUp, Users, Wallet, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const { stats, loading } = useDashboard();

  return (
    <div className="space-y-8">
      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Collected" value={`₱${stats.totalCollected.toLocaleString()}`} icon={<Wallet className="text-blue-600" />} color="blue" />
        <StatCard title="Students Paid" value={stats.paidStudents} icon={<CheckCircle className="text-green-600" />} color="green" />
        <StatCard title="Total Students" value={stats.totalStudents} icon={<Users className="text-purple-600" />} color="purple" />
        <StatCard title="Collection Rate" value={`${Math.round((stats.totalCollected / stats.expectedTotal) * 100)}%`} icon={<TrendingUp className="text-orange-600" />} color="orange" />
      </div>

      {/* Placeholder for Chart or Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 h-64 flex items-center justify-center text-slate-400">
        Chart Visualization (Coming soon...)
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-${color}-50`}>{icon}</div>
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
    </div>
  );
}