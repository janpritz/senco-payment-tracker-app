import { Camera, Users } from "lucide-react";

export const ControlHeader = ({ totalWaiting }: { totalWaiting: number }) => {
  return (
    <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-slate-900 rounded-xl shadow-lg shadow-slate-200">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">
                Staff <span className="text-purple-600">Controller</span>
              </h1>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Pictorial Management System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-black text-slate-700">
                {totalWaiting} Students
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};