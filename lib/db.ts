import Dexie, { Table } from 'dexie';

/**
 * INTERFACES
 */
export interface ReceiptClaim {
    id: number; // Filing ID from backend
    student_id: string;
    full_name: string;
    is_claimed: boolean;
    is_exported: boolean;
    updated_at: string;
}

export interface QueueSync {
    id?: number;
    student_id: string;
    full_name: string;
    college: string;
    timestamp: number;
}

export interface Student {
    student_id: string;
    full_name: string;
    college: string;
    course: string;
    balance: number;
}

export interface Payment {
    id?: number; 
    laravel_id?: number; 
    reference_number: string;
    student_id: string;
    full_name: string; 
    amount: number;
    created_at: string; 
    date: string; 
    sync_status: 'synced' | 'pending' | 'failed';
}

/**
 * DATABASE CLASS
 */
export class SencoDatabase extends Dexie {
    students!: Table<Student>;
    payments!: Table<Payment>;
    queue_sync!: Table<QueueSync>;
    receipt_claims!: Table<ReceiptClaim>; // <--- Added for faster claim searches

    constructor() {
        super('SencoDB');

        // Version 1-3 preserved for history...
        this.version(2).stores({
            students: 'student_id, full_name, college',
            payments: '++id, laravel_id, student_id, reference_number, date, amount, created_at, [student_id+date]'
        });

        this.version(4).stores({
            students: 'student_id, full_name, college',
            payments: '++id, laravel_id, student_id, reference_number, date, sync_status, [student_id+date]',
            queue_sync: '++id, student_id' 
        });

        /**
         * VERSION 5: ADDING RECEIPT CLAIMS CACHE
         * We index 'id' (Filing ID), 'student_id', and 'full_name' for flexible searching.
         */
        this.version(5).stores({
            students: 'student_id, full_name, college',
            payments: '++id, laravel_id, student_id, reference_number, date, sync_status, [student_id+date]',
            queue_sync: '++id, student_id',
            receipt_claims: 'id, student_id, full_name, is_claimed' // <--- Faster Claim Lookups
        });
    }

    async wipeEverything(confirm: boolean = false) {
        if (!confirm) {
            throw new Error('wipeEverything requires confirmation = true');
        }
        await this.delete();
        return this.open();
    }
}

export const db = new SencoDatabase();

/**
 * FORMATTERS
 */

export const formatPaymentForDexie = (laravelData: any): Payment => {
    const rawDate = laravelData.created_at || new Date().toISOString();
    const manilaDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(rawDate));

    return {
        laravel_id: Number(laravelData.id),
        student_id: String(laravelData.student_id),
        full_name: laravelData.full_name || 'Unknown Student',
        amount: Number(laravelData.amount),
        reference_number: laravelData.reference_number || `REF-${laravelData.id}`,
        date: manilaDate,
        created_at: rawDate,
        sync_status: 'synced'
    };
};

/**
 * NEW: Formatter for Claims
 */
export const formatClaimForDexie = (claim: any): ReceiptClaim => ({
    id: Number(claim.id),
    student_id: String(claim.student_id),
    full_name: String(claim.full_name),
    is_claimed: Boolean(claim.is_claimed),
    is_exported: Boolean(claim.is_exported),
    updated_at: claim.updated_at || new Date().toISOString()
});