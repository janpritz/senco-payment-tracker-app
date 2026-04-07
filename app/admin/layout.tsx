"use client";

import { useEffect, useState } from "react";
// 1. Added Wallet icon for the Collection page
import { LayoutDashboard, Receipt, Users, RefreshCw, Menu, X, Wallet, ClipboardList } from "lucide-react";
import { LogoutButton } from "@/components/logoutButton";
import { useAdminLogin } from "@/hooks/useAdminLogin";
// CORRECT IMPORTS: Component from 'next/link', Hooks from 'next/navigation'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import api from "@/lib/axios";
import { toast } from "react-hot-toast"; // Recommended for feedback

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { state } = useAdminLogin();
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);



    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await api.get("/admin/sync-google-sheets");
            toast.success("Masterlist updated successfully!");
        } catch (error) {
            toast.error("Failed to sync sheets.");
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRole(user.role);
        }
    }, [state.user]);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const isAdmin = role === 'Admin';
    const isAdviser = role === 'Adviser';

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* STICKY SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
            `}>
                <div className="p-6 text-white font-bold text-xl border-b border-slate-800 flex items-center justify-between">
                    <span>SENCO <span className="text-blue-400">2026</span></span>
                    <button className="lg:hidden text-slate-400" onClick={() => setIsOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        href="/admin/dashboard"
                        active={pathname === "/admin/dashboard"}
                    />

                    <SidebarItem
                        icon={<Wallet size={20} />}
                        label="Collection"
                        href="/admin/collection"
                        active={pathname === "/admin/collection"}
                    />
                    {isAdmin && <SidebarItem
                        icon={<ClipboardList size={20} />}
                        label="Masterlist"
                        href="/admin/masterlist"
                        active={pathname === "/admin/masterlist"}
                    />}

                    <SidebarItem
                        icon={<Receipt size={20} />}
                        label="Payments"
                        href="/admin/payments"
                        active={pathname === "/admin/payments"}
                    />

                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Transactions"
                        href="/admin/transactions"
                        active={pathname === "/admin/transactions"}
                    />

                    {isAdmin && (
                        <SidebarItem
                            icon={<Users size={20} />}
                            label="Accounts"
                            href="/admin/accounts"
                            active={pathname === "/admin/accounts"}
                        />
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <LogoutButton />
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="p-2 -ml-2 text-slate-600 lg:hidden hover:bg-slate-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] md:text-sm truncate">
                            Finance Panel
                            <span className="hidden md:inline ml-2 px-2 py-0.5 bg-slate-100 rounded text-slate-500">{role}</span>
                        </h2>
                    </div>


                    <div className="flex items-center gap-2 md:gap-4">
                        {isAdmin && (
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className={`flex items-center gap-2 text-[10px] px-3 py-1.5 rounded-full font-bold transition-all ${isSyncing
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95"
                                    }`}
                            >
                                <RefreshCw
                                    size={14}
                                    className={`hidden sm:block ${isSyncing ? "animate-spin" : ""}`}
                                />
                                {isSyncing ? (
                                    "SYNCING..."
                                ) : (
                                    <>
                                        SYNC <span className="hidden sm:inline">SHEETS</span>
                                    </>
                                )}
                            </button>
                        )}
                        <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold border border-slate-700">
                            {role?.substring(0, 3).toUpperCase() || 'USR'}
                        </div>
                    </div>

                </header>

                <section className="p-4 md:p-8">
                    {children}
                </section>
                <Toaster position="top-center" richColors />
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'hover:bg-slate-800 hover:text-white'
                }`}
        >
            {icon}
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
}