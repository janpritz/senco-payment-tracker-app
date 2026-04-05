"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Loader2, ShieldAlert, KeyRound, ShieldCheck, Eye, EyeOff } from "lucide-react";

// 1. Move all your existing logic into this sub-component
function SetupPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // States
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Visibility States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const verifyLink = async () => {
            const user = searchParams.get("user");
            const params = new URLSearchParams(searchParams.toString());
            params.delete("user");

            try {
                const response = await api.get(`/api/password/verify/${user}?${params.toString()}`);

                if (response.data.valid) {
                    if (response.data.is_active) {
                        router.push("/admin/login");
                        return;
                    }
                    setVerifying(false);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || "Invalid or expired link.");
                setVerifying(false);
            }
        };

        if (searchParams.get("signature")) {
            verifyLink();
        } else {
            setVerifying(false);
            setError("Missing security signature.");
        }
    }, [searchParams, router]);

    if (verifying) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Verifying Invitation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 text-center max-w-md w-full">
                    <ShieldAlert className="text-red-500 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-black text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 text-sm mb-6">{error}</p>
                    <a href="/admin/login" className="text-blue-600 font-bold text-sm hover:underline">Return to Login</a>
                </div>
            </div>
        );
    }

    if (success) {
        setTimeout(() => {
            router.push("/admin/login");
        }, 3000);

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Account Activated</h2>
                    <p className="text-slate-500 text-sm mb-8">
                        Your password has been set successfully. <br />
                        Redirecting you to the login page in 3 seconds...
                    </p>
                    <button
                        onClick={() => router.push("/admin/login")}
                        className="w-full py-3 px-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
                    >
                        GO TO LOGIN NOW
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-8 text-white text-center">
                    <h1 className="text-xl font-black tracking-tight uppercase">Set Your Password</h1>
                    <p className="text-slate-400 text-xs mt-1 font-medium">SENCO Finance Committee 2026</p>
                </div>

                <form className="p-8 space-y-5" onSubmit={async (e) => {
                    e.preventDefault();
                    setSubmitting(true);
                    try {
                        const user = searchParams.get("user");
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("user");

                        await api.post(`/api/password/setup/${user}?${params.toString()}`, {
                            password: password,
                            password_confirmation: confirmPassword
                        });
                        setSuccess(true);
                    } catch (err: any) {
                        setError(err.response?.data?.message || "Failed to set password.");
                    } finally {
                        setSubmitting(false);
                    }
                }}>
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-900 uppercase font-black tracking-widest ml-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full pl-4 pr-12 py-3 text-slate-900 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                placeholder="Password must be 8 characters"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-900 uppercase font-black tracking-widest ml-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                className="w-full pl-4 pr-12 py-3 text-slate-900 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                placeholder="Re-enter your password"
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit" disabled={submitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 mt-2"
                    >
                        {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "ACTIVATE ACCOUNT"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// 2. The main export now wraps the content in Suspense
export default function SetupPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Account Setup...</p>
            </div>
        }>
            <SetupPasswordContent />
        </Suspense>
    );
}