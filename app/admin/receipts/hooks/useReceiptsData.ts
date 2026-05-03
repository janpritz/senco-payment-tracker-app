import { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/lib/axios";
import { db, formatPaymentForDexie, formatClaimForDexie, Student as DbStudent, Payment as DbPayment } from '@/lib/db';

export interface StudentWithBalance extends DbStudent {
    payments: DbPayment[];
    remaining_balance: number;
    filing_id?: number;
    is_claimed: boolean;
    is_exported: boolean;
}

const SYNC_KEY = "receipts_synced_v1";

export const useReceiptsData = () => {
    const [studentsWithHistory, setStudentsWithHistory] = useState<StudentWithBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [exportStats, setExportStats] = useState({ count: 0, hasNew: false });

    const loadFromIndexedDB = useCallback(async () => {
        setLoading(true);
        try {
            const [students, payments, claims] = await Promise.all([
                db.students.toArray(),
                db.payments.toArray(),
                db.receipt_claims.toArray()
            ]);

            const enrichedData: StudentWithBalance[] = students.map((student) => {
                const studentPayments = payments.filter(p => p.student_id === student.student_id);
                const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                const startingBalance = student.balance > 0 ? student.balance : 4000;
                const claimRecord = claims.find(c => c.student_id === student.student_id);

                return {
                    ...student,
                    payments: studentPayments,
                    remaining_balance: Math.max(0, startingBalance - totalPaid),
                    filing_id: claimRecord?.id,
                    is_claimed: !!claimRecord?.is_claimed,
                    is_exported: !!claimRecord?.is_exported
                };
            });

            setStudentsWithHistory(enrichedData);
        } catch (error) {
            console.error("Local load failed:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const syncAndLoadData = async () => {
        setSyncing(true);
        try {
            const response = await api.get('/admin/receipts/sync');
            const { students, payments, receipt_claims } = response.data;

            await Promise.all([db.students.clear(), db.payments.clear(), db.receipt_claims.clear()]);

            await db.students.bulkPut(students);
            await db.payments.bulkPut(payments.map(formatPaymentForDexie));
            await db.receipt_claims.bulkPut(receipt_claims.map(formatClaimForDexie));

            await loadFromIndexedDB();
            localStorage.setItem(SYNC_KEY, "true");
        } catch (error) {
            console.error("Sync failed:", error);
        } finally {
            setSyncing(false);
        }
    };

    // Polling Logic
    useEffect(() => {
        const checkUpdates = async () => {
            try {
                // Destructure data directly as the number from the response
                const { data: totalExportedCount } = await api.get<number>('/admin/receipts/check-exports');

                //console.log("Polled total exported count:", totalExportedCount);

                // Get last count from localStorage
                const savedCount = Number(localStorage.getItem('last_exported_count') || 0);

                // Compare the raw number directly
                if (totalExportedCount > savedCount || totalExportedCount === 0) {
                    //console.log(`Syncing: Server (${totalExportedCount}) > Local (${savedCount})`);

                    // Fetch full sync data
                    const response = await api.get('/admin/receipts/sync');
                    const { receipt_claims } = response.data;

                    // Update IndexedDB
                    await db.receipt_claims.bulkPut(receipt_claims.map(formatClaimForDexie));

                    // Update LocalStorage with the new total
                    localStorage.setItem('last_exported_count', totalExportedCount.toString());

                    // Update UI state
                    setExportStats({
                        count: totalExportedCount,
                        hasNew: true
                    });

                    // Trigger the local refresh
                    loadFromIndexedDB();
                } else {
                    // Just keep the count in sync without triggering a "New" alert
                    setExportStats(prev => ({ ...prev, count: totalExportedCount }));
                }
            } catch (err) {
                console.error("Poll error:", err);
            }
        };

        const interval = setInterval(checkUpdates, 30000);
        return () => clearInterval(interval);
    }, [loadFromIndexedDB]);

    // Initial Sync
    useEffect(() => {
        if (!localStorage.getItem(SYNC_KEY)) syncAndLoadData();
        else loadFromIndexedDB();
    }, [loadFromIndexedDB]);

    const stats = useMemo(() => {
        const fullyPaidData = studentsWithHistory.filter(s => s.remaining_balance <= 0);
        const zeroPaymentsData = studentsWithHistory.filter(s => s.payments.length === 0);
        const pendingExportData = fullyPaidData.filter(s => !s.is_exported);

        return {
            fullyPaidCount: fullyPaidData.length,
            fullyPaidData,
            zeroPaymentsCount: zeroPaymentsData.length,
            zeroPaymentsData,
            pendingExportCount: pendingExportData.length,
            pendingExportData,
            totalClaimed: fullyPaidData.filter(s => s.is_claimed).length,
            totalExported: fullyPaidData.filter(s => s.is_exported).length
        };
    }, [studentsWithHistory]);

    return { studentsWithHistory, loading, syncing, exportStats, stats, syncAndLoadData, loadFromIndexedDB };
};