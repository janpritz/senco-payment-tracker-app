"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { 
    UserPlus, 
    Users, 
    X, 
    Loader2, 
    ShieldCheck, 
    Mail, 
    UserCircle,
    SendHorizontal,
    CheckCircle2
} from "lucide-react";

interface User {
    id: number; // Added ID for resend targeting
    name: string;
    email: string;
    role: string;
    email_verified_at: string | null; // Track verification status
}

export default function AccountsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [resendingId, setResendingId] = useState<number | null>(null);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "Treasurer",
        password:""
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/api/admin/users/add', formData);
            setOpen(false);
            setFormData({ name: "", email: "", role: "Auditor", password: ""});
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || "Error adding user");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Resend Invitation Logic ---
    const handleResendInvite = async (user: User) => {
        setResendingId(user.id);
        try {
            await api.post(`/api/admin/users/${user.id}/resend-invite`);
            alert(`Invitation resent to ${user.email}`);
        } catch (err: any) {
            alert("Failed to resend invitation.");
        } finally {
            setResendingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Committee Accounts</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage access for SENCO Finance Committee 2026</p>
                </div>
                <button 
                    onClick={() => setOpen(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 font-bold"
                >
                    <UserPlus size={18} />
                    ADD NEW MEMBER
                </button>
            </div>

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
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-4"><div className="h-10 w-40 bg-slate-100 rounded-xl" /></td>
                                    <td className="p-4"><div className="h-4 w-48 bg-slate-100 rounded" /></td>
                                    <td className="p-4 flex justify-end"><div className="h-8 w-24 bg-slate-100 rounded-lg" /></td>
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-20 text-center text-slate-400">
                                    <Users size={40} className="mx-auto mb-2 opacity-20" />
                                    No members registered.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <UserCircle size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{user.name}</div>
                                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{user.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 font-medium italic">{user.email}</td>
                                    <td className="p-4 text-right">
                                        {user.email_verified_at ? (
                                            /* --- Verified State --- */
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-black border border-green-100">
                                                <CheckCircle2 size={12} />
                                                VERIFIED
                                            </span>
                                        ) : (
                                            /* --- Unverified State with Resend Button --- */
                                            <button 
                                                onClick={() => handleResendInvite(user)}
                                                disabled={resendingId === user.id}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-[10px] font-black border border-amber-200 disabled:opacity-50"
                                            >
                                                {resendingId === user.id ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <SendHorizontal size={12} />
                                                )}
                                                RESEND INVITE
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal remains the same... */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Committee Member</h2>
                            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    required 
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 text-slate-600 outline-none text-sm font-medium"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input 
                                    type="email" required 
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 text-slate-600 outline-none text-sm font-medium"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 uppercase tracking-widest ml-1">Role</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 outline-none text-sm bg-white"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="Treasurer">Treasurer</option>
                                    <option value="Auditor">Auditor</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all disabled:opacity-70 mt-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : "REGISTER ACCOUNT"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}