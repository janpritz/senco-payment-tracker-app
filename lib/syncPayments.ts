import { db } from "@/lib/db";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

export const syncPendingPayments = async () => {
    const pending = await db.payments
        .where('sync_status')
        .equals('pending')
        .toArray();

    if (pending.length === 0) return;

    const syncToastId = toast.loading(`Syncing ${pending.length} offline transactions...`);

    let successCount = 0;

    for (const payment of pending) {
        try {
            const res = await api.post('/api/admin/payments', {
                student_id: payment.student_id,
                amount: payment.amount,
            });

            const serverData = res.data.payment || res.data;

            await db.payments.update(payment.id!, {
                laravel_id: serverData.id,
                reference_number: serverData.reference_number,
                sync_status: 'synced'
            });

            successCount++;
        } catch (err: any) {
            if (err.response?.status === 401) {
                toast.dismiss(syncToastId);
                console.warn("User not authenticated. Sync paused.");
                return;
            }

            console.error("❌ Sync failed for ID:", payment.id);
            continue;
        }
    }

    toast.dismiss(syncToastId);

    if (successCount === pending.length) {
        toast.success(`✅ All ${successCount} payments synced to server!`);
    } else if (successCount > 0) {
        toast.success(`⚠️ Partial sync: ${successCount}/${pending.length} saved.`);
    } else {
        toast.error("❌ Sync failed. Will retry when connection improves.");
    }
};