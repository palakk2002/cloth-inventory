import React, { useState } from 'react';
import {
    User,
    Store,
    Bell,
    Shield,
    Globe,
    Save,
    Mail,
    Phone,
    MapPin,
    Lock
} from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'store', label: 'Store Details', icon: Store },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    const [profileForm, setProfileForm] = useState({
        name: 'Palak',
        email: 'palak@example.com',
        phone: '+91 98765 43210'
    });

    const [storeForm, setStoreForm] = useState({
        storeName: 'Cloth Inventory',
        address: '123 Fashion Street, New Delhi, India',
        currency: 'INR (₹)',
        timezone: 'GMT +5:30'
    });

    const handleSave = (e) => {
        e.preventDefault();
        alert('Settings saved successfully! (Simulated)');
    };

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and store configurations</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-md'
                                : 'text-muted-foreground hover:bg-muted'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="card p-6 lg:p-8">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                        P
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">Profile Picture</h3>
                                        <button type="button" className="text-sm font-semibold text-primary hover:underline">Change Photo</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-muted-foreground" /> Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <button type="submit" className="btn-primary flex items-center gap-2">
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'store' && (
                            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Store Name</label>
                                    <input
                                        type="text"
                                        value={storeForm.storeName}
                                        onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Store Address</label>
                                    <textarea
                                        rows="3"
                                        value={storeForm.address}
                                        onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-muted-foreground" /> Currency
                                        </label>
                                        <select
                                            value={storeForm.currency}
                                            onChange={(e) => setStoreForm({ ...storeForm, currency: e.target.value })}
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            <option>INR (₹)</option>
                                            <option>USD ($)</option>
                                            <option>EUR (€)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Timezone</label>
                                        <select
                                            value={storeForm.timezone}
                                            onChange={(e) => setStoreForm({ ...storeForm, timezone: e.target.value })}
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            <option>GMT +5:30</option>
                                            <option>GMT +0:00</option>
                                            <option>GMT -5:00</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <button type="submit" className="btn-primary flex items-center gap-2">
                                        <Save className="w-4 h-4" /> Save Store Details
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold mb-4">Notification Preferences</h3>
                                <div className="space-y-4">
                                    {[
                                        { id: 'stock', label: 'Low Stock Alerts', desc: 'Get notified when items drop below threshold' },
                                        { id: 'sales', label: 'Daily Sales Report', desc: 'Receive a summary of daily revenue' },
                                        { id: 'staff', label: 'Staff Activities', desc: 'Alerts for staff management changes' },
                                    ].map((pref) => (
                                        <div key={pref.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                                            <div>
                                                <p className="font-bold text-sm">{pref.label}</p>
                                                <p className="text-xs text-muted-foreground">{pref.desc}</p>
                                            </div>
                                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary cursor-pointer">
                                                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                                <h3 className="text-lg font-bold mb-4">Update Password</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-muted-foreground" /> Current Password
                                        </label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">New Password</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Confirm New Password</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-border">
                                    <button type="submit" className="btn-primary flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Update Password
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
