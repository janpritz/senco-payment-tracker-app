// Helper to format date (place this outside the component or in a utils file)
export const formatDate = (dateString: string) => {
  if (!dateString || dateString === "No record") return dateString;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};