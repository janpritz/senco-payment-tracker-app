export function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "Fully Paid";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
      isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
    }`}>
      {isPaid ? "✔ Fully Paid" : "⏳ Installment"}
    </span>
  );
}