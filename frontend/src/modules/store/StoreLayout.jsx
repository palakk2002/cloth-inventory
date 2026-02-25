import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Store, User, Clock, ArrowLeft, PackageCheck, Package, Receipt, History } from 'lucide-react';

const storeNavItems = [
    { icon: PackageCheck, label: 'Receive Stock', path: '/store/receive' },
    { icon: Package, label: 'Shop Stock', path: '/store/stock' },
    { icon: Receipt, label: 'Billing (POS)', path: '/store/pos' },
    { icon: History, label: 'Sales History', path: '/store/sales-history' },
];

export default function StoreLayout() {
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

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            {/* Top Header Bar */}
            <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-[#1E3A56] px-4 lg:px-8 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Fashion Hub</h1>
                            <p className="text-[10px] uppercase tracking-widest text-white/60 font-medium">Store Module</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Clock */}
                    <div className="hidden sm:flex items-center gap-2 text-white/80">
                        <Clock className="w-4 h-4" />
                        <div className="text-right">
                            <p className="text-sm font-semibold leading-tight">{formatTime(currentTime)}</p>
                            <p className="text-[10px] text-white/50">{formatDate(currentTime)}</p>
                        </div>
                    </div>

                    {/* Staff Info */}
                    <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold">Rahul Sharma</p>
                            <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Counter Staff</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                            <User className="w-5 h-5" />
                        </div>
                    </div>


                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="bg-white border-b border-border shadow-sm px-4 lg:px-8">
                <div className="flex gap-1">
                    {storeNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2
                                ${isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/30'
                                }
                            `}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-6 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
