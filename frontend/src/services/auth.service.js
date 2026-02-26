import api from './api';

const authService = {
    // ── Admin Auth ──────────────────────────────────────────────

    adminLogin: async (email, password) => {
        const res = await api.post('/auth/admin/login', { email, password });
        return res.data; // { success, token, user }
    },

    adminRegister: async (name, email, password, adminSecret) => {
        const res = await api.post('/auth/admin/register', { name, email, password, adminSecret });
        return res.data;
    },

    // ── Store Auth ──────────────────────────────────────────────

    storeLogin: async (email, password) => {
        const res = await api.post('/auth/store/login', { email, password });
        return res.data;
    },

    storeRegister: async (name, email, password, shopName) => {
        const res = await api.post('/auth/store/register', { name, email, password, shopName });
        return res.data;
    },

    // ── Shared ──────────────────────────────────────────────────

    getMe: async () => {
        const res = await api.get('/auth/me');
        return res.data; // { success, user }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (_) {
            // Ignore errors on logout
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('auth_user') || localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

export default authService;
