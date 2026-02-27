import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Store, User, Clock, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StoreSidebar from './components/StoreSidebar';

export default function StoreLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const displayName = user?.name || 'Staff';
    const displayShop = user?.shopName || 'Counter Staff';
    const displayInitial = displayName.charAt(0).toUpperCase();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to log out?')) {
            await logout();
            navigate('/store/login');
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans flex">
            {/* Sidebar */}
            <StoreSidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:pl-64">
                {/* Top Header Bar */}
                <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-white/80 backdrop-blur-md px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        {/* Hamburger for mobile */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Store className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight leading-tight text-slate-900">Store Panel</h1>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{displayShop}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Clock */}
                        <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <div className="text-right">
                                <p className="text-sm font-semibold leading-tight text-slate-700">{formatTime(currentTime)}</p>
                                <p className="text-[10px] text-muted-foreground">{formatDate(currentTime)}</p>
                            </div>
                        </div>

                        {/* Staff Info */}
                        <div className="flex items-center gap-3 pl-4 border-l border-border">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900">{displayName}</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Store Staff</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20">
                                {displayInitial}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
