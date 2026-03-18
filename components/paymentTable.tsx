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
    <div className="mt-6 border border-gray-100 rounded-xl shadow-sm overflow-hidden bg-white relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600 min-w-full">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100">
              <th className="p-3 ps-9 font-bold uppercase tracking-wider text-gray-400">Date</th>
              <th className="p-3 font-bold uppercase tracking-wider text-gray-400">Amount</th>
              {/* Added text-right for better mobile alignment */}
              <th className="p-3 ps-10 font-bold uppercase tracking-wider text-gray-400 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history && history.length > 0 ? (
              history.map((record, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 whitespace-nowrap">
                    {formatDate(record.date)}
                  </td>
                  <td className="p-3 font-bold text-gray-900 whitespace-nowrap text-right">
                    {formatCurrency(record.payment)}
                  </td>
                  <td className="p-3 text-left">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-400 italic">No records</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}