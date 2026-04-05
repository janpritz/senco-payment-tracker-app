import { UserCircle, CheckCircle2, SendHorizontal, Loader2, Ban, Trash2 } from "lucide-react";
import { User } from "@/types/user";

interface UserRowProps {
    user: User;
    isResending: boolean;
    onResend: (user: User) => void;
    onAction: (type: 'suspend' | 'delete', user: User) => void;
}

export function UserRow({ user, isResending, onResend, onAction }: UserRowProps) {
    const isProtected = user.id === 1 || user.name === "Senco Admin";
    return (
        <tr className="hover:bg-slate-50/50 transition-colors group">
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
                <div className="flex items-center justify-end gap-2">
                    {user.email_verified_at ? (
                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-black border border-green-100">
                            VERIFIED
                        </span>
                    ) : (
                        <button
                            onClick={() => onResend(user)}
                            disabled={isResending}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-black border border-amber-200"
                        >
                            {isResending ? <Loader2 size={12} className="animate-spin" /> : <SendHorizontal size={12} />}
                            RESEND
                        </button>
                    )}

                    <div className="w-[1px] h-4 bg-slate-200 mx-1" />

                    <button
                        onClick={() => onAction('suspend', user)}
                        disabled={isProtected}
                        className={`p-2 rounded-lg transition-colors ${isProtected
                                ? "opacity-20 cursor-not-allowed text-slate-300"
                                : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                            }`}
                        title={isProtected ? "Root account protected" : "Suspend"}
                    >
                        <Ban size={16} />
                    </button>

                    <button
                        onClick={() => onAction('delete', user)}
                        disabled={isProtected}
                        className={`p-2 rounded-lg transition-colors ${isProtected
                                ? "opacity-20 cursor-not-allowed text-slate-300"
                                : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                            }`}
                        title={isProtected ? "Root account protected" : "Delete"}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}