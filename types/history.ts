export interface PaymentHistory {
  amount: number;
  reference: string;
  collected_by: string;
  date: string;
  payment_status?: string;
}