import { useState } from "react";
import { X, Loader2, Mail, Shield, User, Info } from "lucide-react";
import { UserFormData } from "@/types/user";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<UserFormData, "password">) => Promise<{ success: boolean; error?: string }>;
    isSubmitting: boolean;
}

export function AddUserModal({ isOpen, onClose, onSubmit, isSubmitting }: AddUserModalProps) {
    const [formData, setFormData] = useState<Omit<UserFormData, "password">>({
        name: "", 
        email: "", 
        role: "Treasurer" // Default role
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await onSubmit(formData);
        if (result.success) {
            setFormData({ name: "", email: "", role: "Treasurer" });
            onClose();
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">New Committee</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Management Portal</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                            <User size={12} /> Full Name
                        </label>
                        <input 
                            required 
                            type="text"
                            placeholder="Full Name"
                            className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Mail size={12} /> Institutional Email
                        </label>
                        <input 
                            required 
                            type="email"
                            placeholder="email@example.com"
                            className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Shield size={12} /> System Role
                        </label>
                        <div className="relative">
                            <select 
                                className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="Admin">Admin</option>
                                <option value="Adviser">Adviser</option>
                                <option value="Treasurer">Treasurer</option>
                                <option value="Auditor">Auditor</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Shield size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
                        <Info className="text-slate-400 shrink-0" size={18} />
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                            Credentials will be sent to the email provided. Passwords must be configured by the user upon their first entry.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            "REGISTER ACCOUNT"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}