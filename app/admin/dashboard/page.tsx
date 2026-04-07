"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { TrendingUp, Users, Wallet, CheckCircle, CalendarDays, School, AlertCircle, Clock } from "lucide-react";
import ContributionGoal from "@/components/admin/ContributionGoal";
import UserCountCard from "@/components/admin/UserCountCard";
import ReportGenerator from "@/components/dashboard/ReportGenerator";
import AllTimeStats from "@/components/dashboard/CollegeStatsGrid";

export default function DashboardPage() {
  const { stats, loading, updateGoal, collegeBreakdown } = useDashboard();

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Goal Component */}
      <ContributionGoal
        currentCollected={stats.totalCollected}
        totalStudents={stats.totalStudents}
        initialGoal={stats.contributionFee || 1500}
        onGoalUpdate={(newAmount) => updateGoal(newAmount)}
      />

      {/* 2. Top Stat Grid */}
      <div className="space-y-6">
        {/* Modular Report Generator Row */}
        <ReportGenerator />

        {/* Updated Grid: Now 4 columns on large screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Today's Collection"
            value={`₱${(stats.dailyCollection || 0).toLocaleString()}`}
            icon={<CalendarDays size={20} />}
            color="emerald"
          />
          <StatCard
            title="Fully Paid"
            value={stats.fullyPaidStudents}
            icon={<CheckCircle size={20} />}
            color="purple"
          />
          {/* NEW: Partial Payment Stat */}
          {/* NEW: Partial Payment Stat
          <StatCard
            title="Partial Payment"
            value={stats.partialPaymentStudents || 0} // Pulled from global stats
            icon={<Clock size={20} />}
            color="blue"
          /> */}
          <StatCard
            title="Collection Rate"
            value={`${Math.round((stats.totalCollected / (stats.totalStudents * (stats.contributionFee || 4000))) * 100) || 0}%`}
            icon={<TrendingUp size={20} />}
            color="orange"
          />
        </div>
      </div>

      {/* All Time College Stats Collected Amount */}
      <AllTimeStats/>
    
      {/* 3. College Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <School size={16} className="text-emerald-600" /> College Distribution
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                  <th className="px-8 py-5">College</th>
                  <th className="px-4 py-5 text-center">Total</th>
                  <th className="px-4 py-5 text-center text-emerald-600">Fully Paid</th>
                  <th className="px-4 py-5 text-center text-amber-600">Partially Paid</th>
                  <th className="px-4 py-5 text-center text-red-500">Zero Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {collegeBreakdown?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-black text-slate-900 text-sm">{item.college}</td>
                    <td className="px-4 py-5 text-center font-bold text-slate-600">{item.total_students}</td>
                    <td className="px-4 py-5 text-center">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-black">
                        {item.fully_paid}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center font-bold text-slate-600">{item.partial_payments}</td>
                    <td className="px-4 py-5 text-center font-bold text-red-400">{item.zero_payments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Small Summary Card */}
        <div className="bg-slate-900 rounded-[40px] p-8 text-white flex flex-col justify-between shadow-xl">
          <div>
            <AlertCircle className="text-orange-500 mb-4" size={32} />
            <h4 className="text-lg font-black leading-tight">Student Action Needed</h4>
            <p className="text-slate-400 text-xs mt-2 font-medium">There are students across all colleges who haven't started their payments yet.</p>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Total Zero Payment</span>
            <p className="text-4xl font-black mt-1">{stats.zeroPaymentStudents}</p>
          </div>
        </div>
      </div>

      {/* 4. Individual User Transaction Counts */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-1 w-6 bg-blue-600 rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Collector Performance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.userTransactions?.map((user: any) => (
            <UserCountCard
              key={user.id}
              userId={user.id}
              userName={user.name}
              count={user.transactions_count}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ... Rest of your DashboardSkeleton and StatCard functions stay the same

/**
 * LOADING SKELETON COMPONENT
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Skeleton for Goal Section */}
      <div className="h-48 bg-slate-100 rounded-[40px] border border-slate-200" />

      {/* Skeleton for Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] border border-slate-200 space-y-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl" />
            <div className="space-y-2">
              <div className="h-2 w-20 bg-slate-100 rounded" />
              <div className="h-6 w-24 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton for Chart */}
      <div className="h-64 bg-slate-50 rounded-[32px] border border-slate-100" />
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color] || "bg-slate-50"}`}>{icon}</div>
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
    </div>
  );
}