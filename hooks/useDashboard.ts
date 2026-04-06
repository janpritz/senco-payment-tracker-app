// hooks/useDashboard.ts

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

interface CollegeStat {
    college: string;
    total_students: number;
    fully_paid: number;
    zero_payments: number;
    partial_payments: number;
}

interface DashboardStats {
    totalCollected: number;
    dailyCollection: number; // Added
    expectedTotal: number;
    totalStudents: number;
    fullyPaidStudents: number;
    partialPaymentStudents: number; // Add this line
    contributionFee: number;
    zeroPaymentStudents: number; // Added
    userTransactions: UserTransaction[]; // Added
}

export interface UserTransaction {
  id: number;
  name: string;
  transactions_count: number;
}

export function useDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalCollected: 0,
        dailyCollection: 0,
        expectedTotal: 0,
        totalStudents: 0,
        fullyPaidStudents: 0,
        partialPaymentStudents: 0,
        contributionFee: 0,
        zeroPaymentStudents: 0,
        userTransactions: [] as UserTransaction[], // Initialize as empty array
    });
    
    // Move collegeBreakdown into its own state for cleaner access
    const [collegeBreakdown, setCollegeBreakdown] = useState<CollegeStat[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/api/admin/dashboard-stats");
            
            // Sync with Laravel response keys
            setStats({
                ...data.stats,
                contributionFee: data.contribution_fee
            });
            
            setCollegeBreakdown(data.college_breakdown || []);
            
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

    return {
        stats,
        collegeBreakdown,
        loading,
        updateGoal,
        refresh: fetchDashboard,
    };
}