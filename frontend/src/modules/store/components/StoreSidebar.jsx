import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    PackageCheck,
    Package,
    Receipt,
    History,
    Store,
    X,
    LogOut,
    AlertCircle,
} from 'lucide-react';
import Modal from '../../admin/components/Modal';
import { useAuth } from '../../../context/AuthContext';

const storeMenuItems = [
    { icon: PackageCheck, label: 'Receive Stock', path: '/store/receive' },
    { icon: Package, label: 'Shop Stock', path: '/store/stock' },
    { icon: Receipt, label: 'Billing (POS)', path: '/store/pos' },
    { icon: History, label: 'Sales History', path: '/store/sales-history' },
    { icon: Receipt, label: 'Invoice History', path: '/store/invoice-history' },
];

export default function StoreSidebar({ isOpen, toggle }) {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        setIsLogoutModalOpen(false);
        await logout();
        navigate('/store/login');
    };

    return (
        <>
            {/* Mobile overlay backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggle}
            />

            <aside className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#1E3A56] text-white flex flex-col transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Header */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tight">Cloth Inventory</span>
                            <p className="text-[10px] uppercase tracking-widest text-white/60 font-medium">Store Module</p>
                        </div>
                    </div>
                    <button className="lg:hidden" onClick={toggle}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {storeMenuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => { if (window.innerWidth < 1024) toggle(); }}
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

                    {/* Logout */}
                    <div className="pt-4 mt-4 border-t border-white/10">
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all mt-1"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </nav>
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
                        <p className="text-sm text-slate-500">You will be logged out of your store account.</p>
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
