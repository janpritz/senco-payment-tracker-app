import axios from 'axios';

const api = axios.create({
    //baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v2', // Adjust this to match your Laravel API URL
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.accsangkaychatbot.com',
    withCredentials: true, // MANDATORY for cookies
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
});

// THIS IS THE FIX: 
// Manually attach the XSRF token from the cookie to every request header
api.interceptors.request.use((config) => {
    const cookies = document.cookie.split('; ');
    const xsrfCookie = cookies.find(row => row.startsWith('XSRF-TOKEN='));
    
    if (xsrfCookie) {
        const token = decodeURIComponent(xsrfCookie.split('=')[1]);
        config.headers['X-XSRF-TOKEN'] = token;
    }

    const token = localStorage.getItem("admin_token"); // or wherever you store it
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

export default api;