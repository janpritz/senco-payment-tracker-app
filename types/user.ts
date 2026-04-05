export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at: string | null;
}

export interface UserFormData {
    name: string;
    email: string;
    role: string;
    password?: string;
}