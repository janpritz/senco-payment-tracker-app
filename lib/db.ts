import Dexie, { Table } from 'dexie';

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
        this.version(3) // Increment version
            .stores({
                students: 'student_id, full_name, college',
                payments: `
            ++id,
            laravel_id,
            student_id,
            reference_number,
            date,
            sync_status, 
            [student_id+date]
        `
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
export const formatPaymentForDexie = (laravelData: any): Payment => {
    const rawDate = laravelData.created_at || new Date().toISOString();

    const manilaDate = new Date(rawDate).toLocaleString('en-CA', {
        timeZone: 'Asia/Manila',
        hour12: false
    }).split(',')[0];

    return {
        laravel_id: laravelData.id,
        student_id: laravelData.student_id,
        full_name: laravelData.full_name || 'Student',
        amount: Number(laravelData.amount),
        reference_number: laravelData.reference_number,
        date: manilaDate,
        created_at: rawDate,
        sync_status: 'synced'
    };
};