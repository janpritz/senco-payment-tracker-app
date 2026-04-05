import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { UserFormData } from "@/types/user";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => Promise<{ success: boolean; error?: string }>;
    isSubmitting: boolean;
}

export function AddUserModal({ isOpen, onClose, onSubmit, isSubmitting }: AddUserModalProps) {
    const [formData, setFormData] = useState<UserFormData>({
        name: "", email: "", role: "Treasurer", password: ""
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await onSubmit(formData);
        if (result.success) {
            setFormData({ name: "", email: "", role: "Treasurer", password: "" });
            onClose();
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Committee Member</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Input fields as per your original design */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                            required 
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none text-sm"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    {/* ... repeat for Email and Role select ... */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all disabled:opacity-70"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "REGISTER ACCOUNT"}
                    </button>
                </form>
            </div>
        </div>
    );
}