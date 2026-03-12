export interface PaymentRecord {
  Timestamp: string;
  "Student ID": string;
  "Name": string;
  Payment: string | number;
  Balance: string | number;
  "Last Payment": string;
  Status: "Fully Paid" | "Installment";
}