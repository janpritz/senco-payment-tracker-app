import { formatDate, formatCurrency } from "@/utils/formatters";
import { StatusBadge } from "@/components/statusBadge";
// @/components/paymentTable.tsx
import { PaymentHistory } from "@/types/history";
import { StudentPayment } from "@/types/payment";


export function PaymentTable({ history }: { history: PaymentHistory[] }) {
  return (
    <div className="mt-6 border border-gray-100 rounded-xl shadow-sm overflow-hidden bg-white relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600 min-w-full">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100">
              <th className="p-3 ps-9 font-bold uppercase tracking-wider text-gray-400">Date</th>
              <th className="p-3 font-bold uppercase tracking-wider text-gray-400">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history && history.length > 0 ? (
              history.map((record, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 whitespace-nowrap">
                    {formatDate(record.date)}
                  </td>
                  <td className="p-3 font-bold text-gray-900 whitespace-nowrap">
                    {formatCurrency(record.amount)}
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