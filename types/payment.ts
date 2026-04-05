import { PaymentHistory } from "@/types/history";

export interface StudentPayment {
  student_id: string;
  name: string;
  total_paid: number;
  balance: number;
  account_status: "Fully Paid" | "Partially Paid";
  latest_payment: number;
  history: PaymentHistory[];
}

