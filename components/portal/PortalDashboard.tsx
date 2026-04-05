// components/portal/PortalDashboard.tsx
import { StudentPayment } from "@/types/payment";
import { DetailRow } from "@/components/detailRow";
import { StatusBadge } from "@/components/statusBadge";
import { PaymentTable } from "@/components/paymentTable";
import { formatCurrency } from "@/utils/formatters";

interface DashboardProps {
  data: StudentPayment;
  onLogout: () => void;
}

export function PortalDashboard({ data, onLogout }: DashboardProps) {
  return (
    <div className="animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs font-black text-gray-600 uppercase tracking-wider">Account Overview</h2>
        <button onClick={onLogout} className="text-[10px] font-bold text-blue-800 hover:underline">Logout</button>
      </div>

      <div className="space-y-1 bg-blue-50/50 p-5 rounded-[2rem] border border-blue-100/50 mb-8">
        <DetailRow label="Student Name" value={data.name} />
        <DetailRow label="Remaining Balance" value={formatCurrency(data.balance)} />
        <div className="flex justify-between items-center py-3 border-b border-blue-100/30 last:border-0">
          <span className="text-gray-500 text-sm">Payment Status</span>
          <StatusBadge status={data.account_status} />
        </div>
      </div>

      <h2 className="text-xs font-black text-gray-600 uppercase mb-4 tracking-wider">Payment History</h2>
      <PaymentTable history={data.history || []} />
      
      <footer className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">
          © {new Date().getFullYear()} SENCO Payment Tracker<br />
          <span className="text-[9px] opacity-70">Abuyog Community College - SENCO FINANCE COMMITTEE</span>
        </p>
      </footer>
    </div>
  );
}