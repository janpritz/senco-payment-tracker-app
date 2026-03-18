import { formatDate, formatCurrency } from "@/utils/formatters";
import { StatusBadge } from "@/components/statusBadge";

// Ensure this matches your JSON structure exactly
interface PaymentRecord {
  date: string;    // Matches your JSON 'date'
  payment: number; // Matches your JSON 'payment'
  status: string;  // Matches your JSON 'status'
}

export function PaymentTable({ history }: { history: PaymentRecord[] }) {
  return (
    <div className="mt-6 overflow-hidden border border-gray-100 rounded-xl shadow-sm">
      <table className="w-full text-left text-xs text-gray-600">
        <thead className="bg-gray-50/50">
          <tr className="border-b border-gray-100">
            <th className="p-3 font-bold uppercase tracking-wider text-gray-400">Date</th>
            <th className="p-3 font-bold uppercase tracking-wider text-gray-400">Paid</th>
            <th className="p-3 font-bold uppercase tracking-wider text-gray-400">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {history && history.length > 0 ? (
            history.map((record, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                {/* 1. Format the date using our helper */}
                <td className="p-3 whitespace-nowrap">
                  {formatDate(record.date)}
                </td>
                
                {/* 2. Format the currency (e.g., ₱1,000.00) */}
                <td className="p-3 font-bold text-gray-900">
                  {formatCurrency(record.payment)}
                </td>
                
                {/* 3. Badge for the row status */}
                <td className="p-3">
                  <StatusBadge status={record.status} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="p-8 text-center text-gray-400 italic">
                No payment records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}