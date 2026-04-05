// components/admin/DashboardSkeleton.tsx
export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-8">
      {/* Skeleton for Goal Section */}
      <div className="h-64 bg-slate-100 rounded-[40px] border border-slate-200" />

      {/* Skeleton for Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
            <div className="space-y-3">
              <div className="h-3 w-24 bg-slate-100 rounded-full" />
              <div className="h-8 w-32 bg-slate-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton for User Transaction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-[28px] border border-slate-100" />
        ))}
      </div>

      {/* Skeleton for College Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 h-96 overflow-hidden">
        <div className="h-16 bg-slate-50/50 border-b border-slate-100" />
        <div className="p-8 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 w-1/3 bg-slate-100 rounded" />
              <div className="h-4 w-12 bg-slate-100 rounded" />
              <div className="h-4 w-12 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}