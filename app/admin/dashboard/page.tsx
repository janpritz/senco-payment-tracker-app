"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { TrendingUp, Users, Wallet, CheckCircle } from "lucide-react";
import ContributionGoal from "@/components/admin/ContributionGoal"; // Adjust path accordingly

export default function DashboardPage() {
  const { stats, loading, updateGoal } = useDashboard();

  if (loading) return <div className="p-8 font-black uppercase text-slate-400 animate-pulse">Initializing Dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* 1. The Modular Goal Component */}
      <ContributionGoal
        currentCollected={stats.totalCollected}
        totalStudents={stats.totalStudents}
        initialGoal={stats.contributionFee || 1500} // Fallback if not set
        onGoalUpdate={(newAmount) => updateGoal(newAmount)}
      />

      {/* 2. Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Collected" value={`₱${stats.totalCollected.toLocaleString()}`} icon={<Wallet size={20} className="text-blue-600" />} color="blue" />
        <StatCard title="Students Paid" value={stats.paidStudents} icon={<CheckCircle size={20} className="text-emerald-600" />} color="emerald" />
        <StatCard title="Total Students" value={stats.totalStudents} icon={<Users size={20} className="text-purple-600" />} color="purple" />
        <StatCard title="Collection Rate" value={`${Math.round((stats.totalCollected / (stats.totalStudents * stats.contributionFee)) * 100) || 0}%`} icon={<TrendingUp size={20} className="text-orange-600" />} color="orange" />
      </div>

      {/* Placeholder for Chart */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 h-64 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">
        Chart Visualization (Coming soon...)
      </div>
    </div>
  );
}

// Improved StatCard for dynamic colors
function StatCard({ title, value, icon, color }: any) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color] || "bg-slate-50"}`}>{icon}</div>
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
    </div>
  );
}