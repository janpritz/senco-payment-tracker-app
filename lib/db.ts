import Dexie, { Table } from 'dexie';

/**
 * INTERFACES
 */
export interface ReceiptClaim {
    id: number;
    student_id: string;
    full_name: string;
    is_claimed: boolean;
    is_exported: boolean;
    released_by: string;
    claimed_at: string;
    updated_at: string; // Added this
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
            receipt_claims: 'id, student_id, full_name, is_claimed, released_by, claimed_at' // <--- Faster Claim Lookups
        });

        this.version(6).stores({
            students: 'student_id, full_name, college',
            payments: '++id, laravel_id, student_id, reference_number, date, sync_status, [student_id+date]',
            queue_sync: '++id, student_id',
            // Added updated_at and is_exported to the index list for better querying
            receipt_claims: 'id, student_id, full_name, is_claimed, released_by, claimed_at, updated_at'
        });

        // Inside your constructor in db.ts
        this.version(7).stores({
            students: 'student_id, full_name, college',
            payments: '++id, laravel_id, student_id, reference_number, date, sync_status, [student_id+date]',
            queue_sync: '++id, student_id',
            // Add is_exported here so you can use .where('is_exported') in your polling logic
            receipt_claims: 'id, student_id, full_name, is_claimed, is_exported, released_by, claimed_at, updated_at'
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
/**
 * Formatter for Claims
 * Handles backend string "1" -> number 1 conversion
 */
export const formatClaimForDexie = (claim: any): ReceiptClaim => {
    // Standardize the claimed_at date for display (Month Day, Year, Time am/pm)
    const rawClaimedDate = claim.claimed_at || new Date().toISOString();

    const formattedClaimedAt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'long',   // "April"
        day: 'numeric',  // "14"
        hour: '2-digit', // "10"
        minute: '2-digit', // "09"
        hour12: true     // Enables 12-hour format with am/pm
    }).format(new Date(rawClaimedDate));

    // The output will look like: "April 14, 2026, 10:09 AM"

    return {
        id: Number(claim.id),
        student_id: String(claim.student_id),
        // Fallback for full_name to prevent "undefined" or {}
        full_name: typeof claim.full_name === 'string'
            ? claim.full_name
            : (claim.student?.full_name || ""),
        is_claimed: Boolean(claim.is_claimed),
        is_exported: Boolean(claim.is_exported),
        // Fix: Explicitly convert backend string "1" to number 1
        released_by: claim.released_by ? String(claim.released_by) : "System",
        claimed_at: formattedClaimedAt,
        // Keep full timestamp for updated_at to track latest sync
        updated_at: claim.updated_at || new Date().toISOString()
    };
};