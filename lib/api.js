import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.accsangkaychatbot.com',
    //baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v2', // Adjust this to match your Laravel API URL
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
});

// Attach XSRF + Bearer token
api.interceptors.request.use((config) => {
    // Attach XSRF token from cookie
    const cookies = document.cookie.split('; ');
    const xsrfCookie = cookies.find(row => row.startsWith('XSRF-TOKEN='));

    if (xsrfCookie) {
        const token = decodeURIComponent(xsrfCookie.split('=')[1]);
        config.headers['X-XSRF-TOKEN'] = token;
    }

    // Attach Bearer token if exists
    const token = localStorage.getItem("admin_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;