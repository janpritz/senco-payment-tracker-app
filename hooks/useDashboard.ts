// hooks/useDashboard.ts

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

interface DashboardStats {
    totalCollected: number;
    expectedTotal: number;
    totalStudents: number;
    paidStudents: number;
    contributionFee: number;
}

export function useDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalCollected: 0,
        expectedTotal: 0,
        totalStudents: 0,
        paidStudents: 0,
        contributionFee: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/api/admin/dashboard-stats");
            setStats({
                ...data.stats,
                contributionFee: data.contribution_fee
            });
        } catch (error) {
            console.error("Dashboard Sync Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateGoal = async (newAmount: number) => {
        try {
            await api.patch('/api/admin/settings/contribution', { amount: newAmount });
            // Refresh stats to recalculate totals based on new fee
            await fetchDashboard();
        } catch (error) {
            console.error("Failed to update goal");
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return { stats, loading, updateGoal, refresh: fetchDashboard };
}