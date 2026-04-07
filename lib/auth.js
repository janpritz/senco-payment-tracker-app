import axios from 'axios';
import api from './api';

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.accsangkaychatbot.com';
const BASE_URL = 'https://api.accsangkaychatbot.com'; // Adjust this to match your Laravel API URL

export const login = async (credentials) => {
    try {
        // ✅ STEP 1: Get CSRF cookie (IMPORTANT)
        await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
            withCredentials: true
        });

        // ✅ STEP 2: Login request
        const response = await api.post('/api/v2/admin/login', credentials);

        // ✅ STEP 3: Store token if using Bearer auth
        if (response.data?.token) {
            localStorage.setItem('admin_token', response.data.token);
        }

        return response.data;

    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
};