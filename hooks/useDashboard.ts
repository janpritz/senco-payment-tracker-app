import { useState, useEffect } from "react";

export function useDashboard() {
  const [stats, setStats] = useState({
    totalCollected: 0,
    expectedTotal: 4300000, // Example: 1000 students * 4300
    totalStudents: 1000,
    paidStudents: 0
  });

  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock Data for now
    setTimeout(() => {
      setStats({
        totalCollected: 1250000,
        expectedTotal: 4300000,
        totalStudents: 1000,
        paidStudents: 285
      });
      setLoading(false);
    }, 800);
  }, []);

  return { stats, recentPayments, loading };
}