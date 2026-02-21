import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, Menu, User, Settings, LogOut, Package, AlertTriangle } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const notifications = [
        { id: 1, title: 'Low Stock Alert', desc: 'White Shirt (XL) is below 5 units', icon: AlertTriangle, color: 'text-orange-500', time: '2 min ago' },
        { id: 2, title: 'New Stock Added', desc: '20 units of Blue Denim added', icon: Package, color: 'text-green-500', time: '1 hour ago' },
        { id: 3, title: 'Staff Update', desc: 'Rahul joined the team', icon: User, color: 'text-blue-500', time: '5 hours ago' },
    ];

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur-md lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="relative hidden md:block w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        className="w-full pl-10 pr-4 py-2 bg-muted border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowProfile(false);
                        }}
                        className={`relative p-2 rounded-lg transition-colors ${showNotifications ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-border flex items-center justify-between">
                                <h4 className="font-bold">Notifications</h4>
                                <button className="text-xs text-primary font-semibold hover:underline">Mark all read</button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.map((n) => (
                                    <div key={n.id} className="p-4 hover:bg-muted/50 transition-colors border-b border-border/50 cursor-pointer">
                                        <div className="flex gap-3">
                                            <div className={`mt-1 ${n.color}`}>
                                                <n.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold">{n.title}</p>
                                                <p className="text-xs text-muted-foreground">{n.desc}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full p-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowProfile(!showProfile);
                            setShowNotifications(false);
                        }}
                        className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold">Palak</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Admin</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/20">
                            P
                        </div>
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 bg-muted/30 border-b border-border">
                                <p className="text-sm font-bold">Palak</p>
                                <p className="text-xs text-muted-foreground">palak@example.com</p>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => { navigate('/admin/settings'); setShowProfile(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Log out?')) window.location.href = '/';
                                        setShowProfile(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
