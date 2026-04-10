// @/services/paymentService.ts
import api from "@/lib/axios";
import { StudentPayment } from "@/types/payment";

export const fetchStudentRecords = async (studentId: string, portalCode: string): Promise<StudentPayment> => {
  try {
    // We hit our own Laravel API instead of the Google Script
    // Parameters are passed as a query string
    const response = await api.get<StudentPayment>(`/student/records`, {
      params: {
        student_id: studentId,
        portal_code: portalCode,
        key: "payments.Senco2026" // Optional: If you still want a security key
      }
    });

    return response.data;
  } catch (error: any) {
    // Extract the error message from Laravel's response if available
    const message = error.response?.data?.error || "Failed to connect to server";
    throw new Error(message);
  }
};