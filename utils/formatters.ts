export const formatDate = (dateString: string | number) => {
  if (!dateString || dateString === "No record" || dateString === "No payment yet") {
    return dateString;
  }
  
  // If the string is in MM/DD/YYYY HH:mm format, we ensure it's ISO-friendly
  // Google returns "03/12/2026 20:50". replace spaces/slashes if needed
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
};