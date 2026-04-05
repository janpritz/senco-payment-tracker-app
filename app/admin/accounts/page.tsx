"use client";

import { useState } from "react";
import { UserPlus, Users, Search } from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { UserRow } from "@/components/accounts/UserRow";
import { AddUserModal } from "@/components/accounts/AddUserModal";
import { toast } from "sonner"; // Using sonner for action support
import { User } from "@/types/user";

export default function AccountsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        users, loading, submitting, resendingId,
        addUser, resendInvite, suspendUser, deleteUser
    } = useUsers();

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Inside AccountsPage
    const handleAction = (type: 'suspend' | 'delete', user: User) => {
        // 1. Logic Guard: Prevent action on User ID 1 or specific name
        if (user.id === 1 || user.name === "Senco Admin") {
            toast.error("Security Protection: This root account cannot be modified.");
            return;
        }

        const isSuspend = type === 'suspend';
        toast(`Are you sure?`, {
            description: `You are about to ${isSuspend ? 'suspend' : 'delete'} ${user.name}.`,
            action: {
                label: "Confirm",
                onClick: async () => {
                    const res = isSuspend ? await suspendUser(user.id) : await deleteUser(user.id);
                    if (res.success) toast.success(`User ${isSuspend ? 'suspended' : 'deleted'}`);
                    else toast.error("Action failed");
                },
            },
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Committee Accounts</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage access for SENCO Finance Committee 2026</p>
                </div>
                <div className="flex gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search members..."
                            className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg font-bold"
                    >
                        <UserPlus size={18} /> ADD MEMBER
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-left">
                        <tr className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                            <th className="p-4">Name & Role</th>
                            <th className="p-4">Email Address</th>
                            <th className="p-4 text-right">Status / Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <SkeletonRows count={5} />
                        ) : filteredUsers.length === 0 ? (
                            <EmptyState />
                        ) : (
                            filteredUsers.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    isResending={resendingId === user.id}
                                    onResend={resendInvite}
                                    onAction={handleAction}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={addUser}
                isSubmitting={submitting}
            />
        </div>
    );
}

// Small internal helper components to keep the main return clean
function SkeletonRows({ count }: { count: number }) {
    return (
        <>{[...Array(count)].map((_, i) => (
            <tr key={i} className="animate-pulse">
                <td className="p-4"><div className="h-10 w-40 bg-slate-100 rounded-xl" /></td>
                <td className="p-4"><div className="h-4 w-48 bg-slate-100 rounded" /></td>
                <td className="p-4 flex justify-end"><div className="h-8 w-24 bg-slate-100 rounded-lg" /></td>
            </tr>
        ))}</>
    );
}

function EmptyState() {
    return (
        <tr>
            <td colSpan={3} className="py-20 text-center text-slate-400">
                <Users size={40} className="mx-auto mb-2 opacity-20" />
                No members registered.
            </td>
        </tr>
    );
}