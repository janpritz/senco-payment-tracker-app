import { PaymentRecord } from "@/types/payment";

const API_URL = "https://opensheet.elk.sh/1cHCAgDt2Xf2YXFZ7JPz5IgRhGTTJ-TxD-a0FWql8ppI/3";

export const fetchStudentRecords = async (studentId: string): Promise<PaymentRecord[]> => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch data");

    const data: PaymentRecord[] = await res.json();
    console.log(data);

    // Inside fetchStudentRecords
    return data
        .filter((item: any) => item["Student ID"] === studentId)
        .map((item: any) => ({
            ...item,
            // Ensure "Last Payment" exists and is a string
            "Last Payment": item.Timestamp || "No record",
        }))
        .sort((a: any, b: any) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());
};