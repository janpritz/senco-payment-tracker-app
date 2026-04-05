// hooks/useStudentAuth.ts
import { useState, useRef } from "react";
import { StudentPayment } from "@/types/payment";
import { fetchStudentRecords } from "@/services/payment";

export function useStudentAuth() {
  const [studentId, setStudentId] = useState("");
  const [portalCode, setPortalCode] = useState("");
  const [studentData, setStudentData] = useState<StudentPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lastSearchTime = useRef<number>(0);
  const THROTTLE_LIMIT = 2000;

  const login = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const now = Date.now();
    if (now - lastSearchTime.current < THROTTLE_LIMIT) return;
    if (!studentId.trim() || !portalCode.trim() || loading) return;

    lastSearchTime.current = now;
    setLoading(true);
    setError(null);

    try {
      const results = await fetchStudentRecords(studentId, portalCode);
      setStudentData(results);
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setStudentData(null);
    setStudentId("");
    setPortalCode("");
    setError(null);
  };

  return {
    studentId, setStudentId,
    portalCode, setPortalCode,
    studentData, loading, error,
    login, logout
  };
}