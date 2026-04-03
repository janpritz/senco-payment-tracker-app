import { db, Payment } from "@/lib/db";

/**
 * Normalizes Laravel API data into IndexedDB Payment schema
 */
export const formatPaymentForDexie = (laravelData: any): Payment => {
    const rawDate = laravelData.created_at || new Date().toISOString();

    return {
        // ✅ DO NOT TOUCH Dexie auto ID
        laravel_id: laravelData.id,

        student_id: laravelData.student_id,
        full_name: laravelData.full_name || "Unknown Student",
        amount: Number(laravelData.amount),
        reference_number: laravelData.reference_number,

        // ✅ remove stored "time" (derive instead)
        date: new Date(rawDate).toISOString().split('T')[0],
        created_at: rawDate
    };
};