import { Payment } from "@/lib/db";
import { History, ReceiptText, User } from "lucide-react";

interface PaymentHistoryProps {
  selectedStudent: any | null;
  history: Payment[];
}

export function PaymentHistory({ selectedStudent, history }: PaymentHistoryProps) {
  if (!selectedStudent) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
        <User size={48} className="mb-4 text-slate-400" />
        <p className="text-[10px] font-black uppercase text-slate-500">Search student<br />to view history</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in">
      <div className="mb-6">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current Balance</span>
        <p className="text-3xl font-black text-slate-900">
          ₱{(Number(selectedStudent.balance) || 0).toLocaleString()}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {history.length > 0 ? (
          history.map((pay, idx) => (
            <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-black text-slate-900">₱{pay.amount.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-slate-400">{pay.date}</p>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                  pay.sync_status === 'synced' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {pay.sync_status}
                </div>
              </div>
              <p className="text-[8px] font-mono text-slate-400 mt-2 truncate">#{pay.reference_number}</p>
            </div>
          ))
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <ReceiptText size={24} className="mx-auto text-slate-300 mb-2" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No payments made yet</p>
          </div>
        )}
      </div>
    </div>
  );
}