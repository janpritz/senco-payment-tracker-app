import { useState } from "react";
import api from "@/lib/api"; // Use your configured instance for BOTH steps
import { syncPendingPayments } from "@/lib/syncPayments";

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
            // ✅ STEP 1: CSRF Handshake
            // Use 'api' so that the instance sharing the session gets the cookie
            await api.get('/sanctum/csrf-cookie');

            // ✅ STEP 2: Login
            // Ensure this matches your route: /api/v2/login or /login
            const response = await api.post('/api/v2/login', { email, password });

            const userData = response.data.user;
            const token = response.data.token;

            // Optional sync
            await syncPendingPayments();

            setUser(userData);

            // ✅ STEP 3: Storage
            localStorage.setItem('admin_user', JSON.stringify(userData));
            localStorage.setItem('admin_token', token);

            // ✅ STEP 4: Cookies
            const cookieConfig = "path=/; max-age=604800; SameSite=Lax";
            document.cookie = `admin_token=${token}; ${cookieConfig}`;
            document.cookie = `admin_role=${userData.role}; ${cookieConfig}`;

            window.location.href = '/admin/dashboard';

        } catch (err: any) {
            console.error("❌ Login Error:", err);
            // Handle 419 (CSRF Mismatch) vs 401 (Wrong Credentials)
            const message = err.response?.status === 419 
                ? "Session expired. Please refresh and try again." 
                : (err.response?.data?.message || "Login failed.");
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);

        try {
            // optional: adjust if your route is versioned
            await api.post('/api/v2/logout');
        } catch (error) {
            console.error("Session already expired.");
        } finally {
            // Clear storage
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');

            // Clear cookies
            const expireNow = "path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = `admin_token=; ${expireNow}`;
            document.cookie = `admin_role=; ${expireNow}`;

            window.location.href = '/admin/login';
        }
    };

    return {
        state: { email, password, showPassword, loading, error, user },
        actions: { setEmail, setPassword, setShowPassword, handleLogin, handleLogout }
    };
}