import Dexie, { Table } from 'dexie';

/**
 * NEW: QUEUE SYNC TABLE INTERFACE
 */
export interface QueueSync {
    id?: number;
    student_id: string;
    full_name: string;
    college: string;
    timestamp: number;
}

/**
 * STUDENT TABLE
 */
export interface Student {
    student_id: string;
    full_name: string;
    college: string;
    course: string;
    balance: number;
}

/**
 * PAYMENT TABLE
 */
export interface Payment {
    id?: number; // Dexie auto ID
    laravel_id?: number; // backend ID (important for sync)
    reference_number: string;
    student_id: string;
    full_name: string; // optional snapshot for offline UI
    amount: number;
    created_at: string; // ISO datetime
    date: string; // YYYY-MM-DD (for filtering)
    sync_status: 'synced' | 'pending' | 'failed'; // <--- Ensure this matches
}

/**
 * DATABASE CLASS
 */
export class SencoDatabase extends Dexie {
    students!: Table<Student>;
    payments!: Table<Payment>;
    queue_sync!: Table<QueueSync>; // <--- ADD THIS LINE HERE

    constructor() {
        super('SencoDB');

        /**
         * VERSION 1 (initial)
         */
        // this.version(1).stores({
        //     students: 'student_id, full_name, college',
        //     payments: '++id, student_id, reference_number, created_at'
        // });

        /**
         * VERSION 2 (improved schema)
         */
        this.version(2)
            .stores({
                students: 'student_id, full_name, college',

                payments: `
                    ++id,
                    laravel_id,
                    student_id,
                    reference_number,
                    date,
                    amount,
                    created_at,
                    [student_id+date]
                `
            })
            .upgrade(async (tx) => {
                const table = tx.table<Payment>('payments');

                await table.toCollection().modify((payment) => {
                    // Add date if missing
                    if (!payment.date && payment.created_at) {
                        payment.date = new Date(payment.created_at)
                            .toISOString()
                            .split('T')[0];
                    }

                    // Ensure laravel_id exists
                    if ((payment as any).id && !payment.laravel_id) {
                        payment.laravel_id = (payment as any).id;
                    }
                });
            });


        // Inside SencoDatabase constructor
        this.version(3).stores({
            students: 'student_id, full_name, college',
            payments: '++id, laravel_id, student_id, reference_number, date, sync_status, [student_id+date]'
        });

        /**
         * VERSION 4: ADDING INSTANT QUEUE SYNC
         */
        this.version(4).stores({
            students: 'student_id, full_name, college',
            payments: '++id, laravel_id, student_id, reference_number, date, sync_status, [student_id+date]',
            queue_sync: '++id, student_id' // Index student_id for quick lookups
        });
    }

    /**
     * Completely wipes the database from browser storage
     */
    async wipeEverything(confirm: boolean = false) {
        if (!confirm) {
            throw new Error('wipeEverything requires confirmation = true');
        }

        await this.delete();
        return this.open();
    }
}

/**
 * SINGLETON INSTANCE
 */
export const db = new SencoDatabase();

/**
 * FORMATTER: Laravel → Dexie
 */
/**
 * FORMATTER: Laravel → Dexie
 * Uses Intl.DateTimeFormat to ensure a consistent YYYY-MM-DD date 
 * based on Asia/Manila regardless of the user's system clock.
 */
export const formatPaymentForDexie = (laravelData: any): Payment => {
    // Debug: console.log("Data from Laravel:", laravelData); 

    const rawDate = laravelData.created_at || new Date().toISOString();

    const manilaDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(rawDate));

    return {
        // Map Laravel's 'id' to Dexie's 'laravel_id'
        laravel_id: Number(laravelData.id),
        student_id: String(laravelData.student_id),
        full_name: laravelData.full_name || 'Unknown Student',
        amount: Number(laravelData.amount),
        // Ensure this matches the controller key exactly
        reference_number: laravelData.reference_number || `REF-${laravelData.id}`,
        date: manilaDate,
        created_at: rawDate,
        sync_status: 'synced'
    };
};
