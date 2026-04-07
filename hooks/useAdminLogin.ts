import { useState } from "react";
import axios from "axios";
import api from "@/lib/axios";
import { syncPendingPayments } from "@/lib/syncPayments";

const BASE_URL = "https://api.accsangkaychatbot.com";
//const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:8000"; // Adjust this to match your Laravel API URL

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
            // ✅ STEP 1: CSRF (use axios NOT api)
            await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
                withCredentials: true,
            });

            // ✅ STEP 2: Login (correct endpoint)
            const response = await api.post('/api/v2/login', { email, password });

            const userData = response.data.user;
            const token = response.data.token;

            // Optional sync
            await syncPendingPayments();

            setUser(userData);

            // ✅ STEP 3: Local storage
            localStorage.setItem('admin_user', JSON.stringify(userData));
            localStorage.setItem('admin_token', token);

            // ✅ STEP 4: Cookies for middleware
            const cookieConfig = "path=/; max-age=604800; SameSite=Lax";
            document.cookie = `admin_token=${token}; ${cookieConfig}`;
            document.cookie = `admin_role=${userData.role}; ${cookieConfig}`;

            // ✅ Redirect
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