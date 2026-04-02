"use client";

import { useEffect, useState } from "react";
// 1. Added Wallet icon for the Collection page
import { LayoutDashboard, Receipt, Users, RefreshCw, Menu, X, Wallet } from "lucide-react";
import { LogoutButton } from "@/components/logoutButton";
import { useAdminLogin } from "@/hooks/useAdminLogin";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { state } = useAdminLogin();
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

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

    const isAdminOrAdviser = role === 'Admin' || role === 'Adviser';

    return (
        <div className="flex min-h-screen bg-slate-50">
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0 lg:static lg:h-screen
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
                    
                    {/* 2. Added Collection Sidebar Item */}
                    <SidebarItem 
                        icon={<Wallet size={20} />} 
                        label="Collection" 
                        href="/admin/collection" 
                        active={pathname === "/admin/collection"} 
                    />

                    <SidebarItem 
                        icon={<Receipt size={20} />} 
                        label="Payments" 
                        href="/admin/payments" 
                        active={pathname === "/admin/payments"} 
                    />
                    
                    {isAdminOrAdviser && (
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
                        <button className="flex items-center gap-2 text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100 transition-all">
                            <RefreshCw size={14} className="hidden sm:block" />
                            SYNC <span className="hidden sm:inline">SHEETS</span>
                        </button>
                        <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold border border-slate-700">
                            {role?.substring(0, 3).toUpperCase() || 'USR'}
                        </div>
                    </div>
                </header>
                
                <section className="p-4 md:p-8">
                    {children}
                </section>
                <Toaster position="top-center" reverseOrder={false} />
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, href, active = false }: any) {
    return (
        <Link 
            href={href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
        >
            {icon}
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
}