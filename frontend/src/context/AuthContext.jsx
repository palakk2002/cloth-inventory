import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // true on initial mount (restoring session)

    // ── Restore session from localStorage on mount ────────────
    useEffect(() => {
        const restoreSession = async () => {
            const storedToken = localStorage.getItem('auth_token');
            const storedUser = localStorage.getItem('auth_user');

            if (storedToken && storedUser) {
                try {
                    // Re-validate token with backend
                    const data = await authService.getMe();
                    setToken(storedToken);
                    setUser(data.user);
                } catch (_) {
                    // Token invalid / expired
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                }
            }
            setLoading(false);
        };

        restoreSession();
    }, []);

    // ── Login ─────────────────────────────────────────────────
    const login = useCallback((token, userData) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
    }, []);

    // ── Logout ────────────────────────────────────────────────
    const logout = useCallback(async () => {
        await authService.logout();
        setToken(null);
        setUser(null);
    }, []);

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
