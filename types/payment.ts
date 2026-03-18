import { PaymentHistory } from "@/types/history";
export interface StudentPayment {
  student_id: string;
  name: string;
  total_paid: number;
  balance: number;
  status: "Fully Paid" | "Installment";
  latest_payment: number;
  history: PaymentHistory[];
}

