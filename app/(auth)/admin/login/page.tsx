"use client";

import { useAdminLogin } from "@/hooks/useAdminLogin";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // 1. Import the Image component

export default function AdminLoginPage() {
    const { state, actions } = useAdminLogin();

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-100">
                {/* Logo/Header Area */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-.5 group">
                        {/* 2. The Decorative Background/Shadow */}
                        {/* <div className="absolute inset-0 bg-purple-600 rounded-2xl rotate-6 group-hover:rotate-0 transition-transform duration-300 shadow-xl shadow-blue-200"></div> */}

                        {/* 3. Your Custom Icon Container */}
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                            <Image
                                src="/senco_logo_transparent.png" // Path relative to the public folder
                                alt="SENCO Logo"
                                width={64}
                                height={64}
                                className="object-contain p-2"
                                priority // Ensures the logo loads instantly
                            />
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Admin Portal</h1>
                    <p className="text-slate-500 text-sm font-medium">SENCO Finance Committee</p>
                </div>

                {/* Login Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <form onSubmit={actions.handleLogin} className="space-y-5">

                        {/* Error Alert */}
                        {state.error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                                {state.error}
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-sm"
                                    placeholder="admin@senco.edu"
                                    value={state.email}
                                    onChange={(e) => actions.setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Secure Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={state.showPassword ? "text" : "password"}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-12 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-sm"
                                    placeholder="••••••••"
                                    value={state.password}
                                    onChange={(e) => actions.setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => actions.setShowPassword(!state.showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {state.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={state.loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all disabled:bg-slate-300 mt-2 flex items-center justify-center gap-2"
                        >
                            {state.loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-4">
                    <Link
                        href="/"
                        className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
                    >
                        ← Back to Student Portal
                    </Link>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Authorized Personnel Only. All access attempts are logged.<br />
                        © 2026 Abuyog Community College
                    </p>
                </div>
            </div>
        </main>
    );
}