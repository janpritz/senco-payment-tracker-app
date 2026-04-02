"use client";

import { useAdminLogin } from "@/hooks/useAdminLogin";
import { LogOut, Loader2 } from "lucide-react";

export function LogoutButton() {
  const { state, actions } = useAdminLogin();

  const handleConfirmLogout = async () => {
    if (window.confirm("Are you sure you want to end your administrative session?")) {
      await actions.handleLogout();
    }
  };

  return (
    <button
      onClick={handleConfirmLogout}
      disabled={state.loading}
      className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-semibold text-sm group"
    >
      {state.loading ? (
        <Loader2 size={18} className="animate-spin text-red-600" />
      ) : (
        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
      )}
      <span>{state.loading ? "Signing out..." : "Logout"}</span>
    </button>
  );
}