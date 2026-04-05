export function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status?.toLowerCase() || "";
  const isPaid = normalizedStatus === "fully paid" || normalizedStatus === "paid";

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider whitespace-nowrap ${
        isPaid 
          ? "bg-green-100 text-green-700 border border-green-200" 
          : "bg-amber-100 text-amber-700 border border-amber-200"
      }`}
    >
      <span className="mr-1.5">{isPaid ? "✔" : "⏳"}</span>
      {isPaid ? "Fully Paid" : "Partially Paid"}
    </span>
  );
}