import axios from 'axios';

// Get API base URL: prioritize local dev URL but support relative /api for production/proxy
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request Interceptor: Attach JWT token ─────────────────────
api.interceptors.request.use(
    (config) => {
        // Support both naming conventions for compatibility during transition
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 globally ─────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear all possible token/user keys to ensure full logout
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Determine which login to redirect to based on current path
            const pathname = window.location.pathname;
            if (pathname.startsWith('/store')) {
                window.location.href = '/store/login';
            } else if (pathname.startsWith('/admin')) {
                window.location.href = '/admin/login';
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
