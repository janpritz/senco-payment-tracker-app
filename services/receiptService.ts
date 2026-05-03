// @/lib/services/receiptService.ts
import { db } from "@/lib/db";

export const getClaimedReceipts = async () => {
    // 1. Get all claimed records
    const claims = await db.receipt_claims
        .filter(c => c.is_claimed === true)
        .toArray();

    // 2. Get all students to map names
    const students = await db.students.toArray();

    // 3. Attach full_name from students table based on student_id
    return claims.map(claim => {
        const student = students.find(s => s.student_id === claim.student_id);
        return {
            ...claim,
            // Fallback to the claim's own full_name if available, otherwise from students table
            full_name: student?.full_name || claim.full_name || "Unknown Student"
        };
    });
};