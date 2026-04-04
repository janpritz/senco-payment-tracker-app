"use client";

import { useEffect } from "react";
import { syncPendingPayments } from "@/lib/syncPayments";
import { toast } from "react-hot-toast";

export default function SyncObserver() {
    useEffect(() => {
        const triggerSync = () => syncPendingPayments();

        window.addEventListener("online", triggerSync);

        triggerSync();

        return () => {
            window.removeEventListener("online", triggerSync);
        };
    }, []);

    return null;
}