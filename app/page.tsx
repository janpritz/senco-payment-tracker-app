// app/portal/page.tsx
"use client";

import { useStudentAuth } from "@/hooks/useStudentHook";
import { LoginForm } from "@/components/portal/loginFrom";
import { PortalDashboard } from "@/components/portal/PortalDashboard";

export default function Home() {
  const { 
    studentId, setStudentId, 
    portalCode, setPortalCode, 
    studentData, loading, error, 
    login, logout 
  } = useStudentAuth();

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-white">
        
        {/* Header Header */}
        <div className="bg-blue-800 p-5 text-white text-center">
          <h1 className="text-xl font-bold tracking-tight">Senco Student Portal</h1>
          <p className="text-blue-200 text-[10px] mt-1 uppercase tracking-widest font-medium">
            Payment Tracking System
          </p>
        </div>

        <div className="p-8">
          {!studentData ? (
            <LoginForm 
              studentId={studentId} setStudentId={setStudentId}
              portalCode={portalCode} setPortalCode={setPortalCode}
              loading={loading} error={error}
              onSubmit={login}
            />
          ) : (
            <PortalDashboard data={studentData} onLogout={logout} />
          )}
        </div>
      </div>
    </main>
  );
}