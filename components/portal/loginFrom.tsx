// components/portal/LoginForm.tsx
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface LoginFormProps {
  studentId: string;
  setStudentId: (val: string) => void;
  portalCode: string;
  setPortalCode: (val: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({ studentId, setStudentId, portalCode, setPortalCode, loading, error, onSubmit }: LoginFormProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Student ID</label>
        <input
          type="text"
          className="w-full bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all"
          placeholder="2022-01-XXXXX"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Portal Code</label>
        <div className="relative">
          <input
            type={showCode ? "text" : "password"}
            className="w-full bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all"
            placeholder="••••••••"
            value={portalCode}
            onChange={(e) => setPortalCode(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${portalCode ? "text-blue-800" : "text-gray-300"}`}
          >
            {showCode ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-[11px] font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100 animate-in shake">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-800 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-800/20 hover:bg-blue-900 active:scale-[0.98] transition-all disabled:bg-gray-300 mt-4"
      >
        {loading ? "Verifying Access..." : "Sign In"}
      </button>
    </form>
  );
}