import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export function useAdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // STEP 1: The Handshake 🤝
            await api.get('/sanctum/csrf-cookie');

            // --- DEBUG: Print CSRF Token to Console ---
            const cookies = document.cookie.split('; ');
            const csrfCookie = cookies.find(row => row.startsWith('XSRF-TOKEN='));
            const csrfToken = csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : 'Not Found';

            console.log("🛠️ CSRF Token acquired:", csrfToken);
            // ------------------------------------------

            // STEP 2: The Login 🔑
            const response = await api.post('/api/login', { email, password });

            // 1. Store user data in state
            setUser(response.data.user);

            // 2. Persist user data so it survives a page refresh
            localStorage.setItem('admin_user', JSON.stringify(response.data.user));

            localStorage.setItem('admin_token', response.data.token);

            document.cookie = `admin_token=${response.data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

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
            // Hits the Laravel sanctum-protected route
            await api.post('/api/logout');
        } catch (error) {
            console.error("Session already expired or server unreachable.");
        } finally {
            // Hard cleanup
            localStorage.removeItem('admin_token');

            // Remove cookie for middleware authentication
            document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

            // Redirect using window.location to flush React state entirely
            window.location.href = '/admin/login';
        }
    };

    return {
        state: { email, password, showPassword, loading, error, user },
        actions: { setEmail, setPassword, setShowPassword, handleLogin, handleLogout }
    };
}