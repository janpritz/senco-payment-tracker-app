import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { User, UserFormData } from "@/types/user";
import { toast } from "sonner";

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [resendingId, setResendingId] = useState<number | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const addUser = async (formData: UserFormData) => {
        setSubmitting(true);
        try {
            await api.post('/api/admin/users/add', formData);
            await fetchUsers();
            return { success: true };
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error adding user";
            return { success: false, error: msg };
        } finally {
            setSubmitting(false);
        }
    };

    const resendInvite = async (user: User) => {
        setResendingId(user.id);
        try {
            await api.post(`/api/admin/users/${user.id}/resend-invite`);
            return { success: true };
        } catch (err) {
            return { success: false };
        } finally {
            setResendingId(null);
        }
    };

    const handleResend = async (user: User) => {
        const result = await resendInvite(user);
        if (result.success) {
            toast.success(`Invite sent to ${user.email}`);
        } else {
            toast.error("Failed to resend. Please try again later.");
        }
    };

    // Add these inside your useUsers hook
    const suspendUser = async (userId: number) => {
        try {
            await api.post(`/api/admin/users/${userId}/suspend`);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_suspended: true } : u));
            return { success: true };
        } catch (err) {
            return { success: false };
        }
    };

    const deleteUser = async (userId: number) => {
        try {
            await api.delete(`/api/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u.id !== userId));
            return { success: true };
        } catch (err) {
            return { success: false };
        }
    };

    return { users, loading, submitting, resendingId, addUser, resendInvite, deleteUser, handleResend, suspendUser };
}