import { PaymentRecord } from "@/types/payment";
import { StatusBadge } from "@/components/statusBadge";

export function PaymentTable({ history }: { history: PaymentRecord[] }) {
  return (
    <div className="mt-6 overflow-hidden border rounded-xl">
      <table className="w-full text-left text-xs text-gray-600">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Paid</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {history.map((record, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="p-3">{new Date(record.Timestamp).toLocaleDateString()}</td>
              <td className="p-3 font-semibold text-gray-900">₱{record.Payment}</td>
              <td className="p-3"><StatusBadge status={record.Status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}