import { useState } from "react";
import api from "@/lib/axios";
import { syncPendingPayments } from "@/lib/syncPayments";
import { Toaster } from "react-hot-toast";

export function useAdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // STEP 1: Sanctum CSRF Handshake
            await api.get('/sanctum/csrf-cookie');

            // STEP 2: Perform Login
            const response = await api.post('/api/login', { email, password });
            const userData = response.data.user;
            const token = response.data.token;
            await syncPendingPayments();

            setUser(userData);

            // STEP 3: Persist for Client-side (UI logic)
            localStorage.setItem('admin_user', JSON.stringify(userData));
            localStorage.setItem('admin_token', token);

            // STEP 4: Persist for Middleware (Server-side logic)
            // Setting cookies manually using document.cookie
            const cookieConfig = "path=/; max-age=604800; SameSite=Lax"; // 7 days
            document.cookie = `admin_token=${token}; ${cookieConfig}`;
            document.cookie = `admin_role=${userData.role}; ${cookieConfig}`;

            // Hard redirect to dashboard to ensure middleware triggers
            window.location.href = '/admin/dashboard';
        } catch (err: any) {
            console.error("❌ Login Error:", err);
            setError(err.response?.data?.message || "Login failed. Please check credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await api.post('/api/logout');
        } catch (error) {
            console.error("Session already expired.");
        } finally {
            // 1. Clear Local Storage
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');

            // 2. Clear Cookies (Set expiry to past date)
            const expireNow = "path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = `admin_token=; ${expireNow}`;
            document.cookie = `admin_role=; ${expireNow}`;

            // 3. Redirect to login
            window.location.href = '/admin/login';
        }
    };

    return {
        state: { email, password, showPassword, loading, error, user },
        actions: { setEmail, setPassword, setShowPassword, handleLogin, handleLogout }
    };
}