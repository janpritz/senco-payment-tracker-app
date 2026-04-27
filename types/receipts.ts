export interface Payment {
    id: number;
    reference_number: string;
    amount: string | number;
    created_at: string;
}

export interface Student {
    student_id: string;
    full_name: string;
    college: string;
    remaining_balance: number;
    payments: Payment[];
}