import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Modal from './Modal';
import {
    LayoutDashboard,
    Tag,
    Package,
    Box,
    Users,
    BarChart3,
    Settings,
    X,
    LogOut,
    AlertCircle
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Tag, label: 'Categories', path: '/admin/categories' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Box, label: 'Stock Management', path: '/admin/stock' },
    { icon: Users, label: 'Staff', path: '/admin/staff' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
];

export default function Sidebar({ isOpen, toggle }) {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        setIsLogoutModalOpen(false);
        window.location.href = '/';
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggle}
            />

            <aside className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#1E3A56] text-white flex flex-col transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Package className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Cloth Inventory</span>
                    </div>
                    <button className="lg:hidden" onClick={toggle}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                                    ? 'bg-white/15 text-white shadow-sm'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }
              `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <NavLink
                        to="/admin/settings"
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}
            `}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </NavLink>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all mt-1"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                title="Confirm Logout"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">Are you sure?</h4>
                        <p className="text-sm text-slate-500">You will be logged out of your admin account.</p>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsLogoutModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-border rounded-lg font-medium text-slate-700 hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all shadow-md active:scale-95"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
