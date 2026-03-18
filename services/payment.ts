import { StudentPayment } from "@/types/payment";

export const fetchStudentRecords = async (studentId: string, portalCode: string): Promise<StudentPayment> => {
  // We now append &portal_code= to the URL
  const url = `https://script.google.com/macros/s/AKfycbxppx8L8GzMSDQGLjNpxQiDmWUDoP03HJ4LAneIBYz-K_3JLyji3dx80vCXnx9q1HFQ/exec?student_id=${encodeURIComponent(studentId)}&portal_code=${encodeURIComponent(portalCode)}&key=payments.Senco2026`;

  const res = await fetch(url, {
    method: "GET",
    redirect: "follow", 
  });

  if (!res.ok) throw new Error("Failed to connect to server");

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  return data;
};