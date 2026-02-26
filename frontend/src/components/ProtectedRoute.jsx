import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Redirects to login if not authenticated or wrong role
 * @param {string} role - 'admin' | 'store_staff' — required role
 * @param {ReactNode} children
 */
export default function ProtectedRoute({ children, role }) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Show nothing while session is being restored
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#1E3A56] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium">Loading session...</p>
                </div>
            </div>
        );
    }

    // Not logged in
    if (!isAuthenticated) {
        const redirectTo = role === 'store_staff' ? '/store/login' : '/admin/login';
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Wrong role
    if (role && user?.role !== role) {
        const redirectTo = user?.role === 'store_staff' ? '/store/pos' : '/admin/dashboard';
        return <Navigate to={redirectTo} replace />;
    }

    return children;
}
