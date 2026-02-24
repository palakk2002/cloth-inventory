import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import StatCard from '../components/StatCard';
import CustomerDetailsModal from './CustomerDetailsModal';
import {
    Users,
    ShoppingBag,
    IndianRupee,
    UserCheck,
    Package,
    Search,
    Filter,
    X,
    Calendar,
    Store,
    User,
    Eye,
    ChevronRight,
    ArrowRight
} from 'lucide-react';

export default function CustomerManagement() {
    const { state } = useAdmin();

    // Filter states
    const [shopFilter, setShopFilter] = useState('');
    const [customerFilter, setCustomerFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Modal state
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Helper functions for data lookup
    const getCustomerName = (id) => state.customers.find(c => c.id === id)?.name || '—';
    const getShopName = (id) => state.shops.find(s => s.id === id)?.name || '—';
    const getProductName = (id) => state.fabricProducts.find(p => p.id === id)?.name || '—';

    // Section 1: Data Calculations for Summary Cards
    const analytics = useMemo(() => {
        const totalCustomers = state.customers.length;
        const totalOrders = state.customerPurchases.length;
        const totalRevenue = state.customerPurchases.reduce((acc, p) => acc + p.totalAmount, 0);

        // Find Top Buying Customer
        const customerSpent = state.customerPurchases.reduce((acc, p) => {
            acc[p.customerId] = (acc[p.customerId] || 0) + p.totalAmount;
            return acc;
        }, {});

        const topCustomerId = Object.entries(customerSpent).sort((a, b) => b[1] - a[1])[0]?.[0];
        const topCustomerName = topCustomerId ? getCustomerName(parseInt(topCustomerId)) : '—';

        // Find Top Selling Product
        const productQty = state.customerPurchases.reduce((acc, p) => {
            acc[p.fabricProductId] = (acc[p.fabricProductId] || 0) + p.quantity;
            return acc;
        }, {});

        const topProductId = Object.entries(productQty).sort((a, b) => b[1] - a[1])[0]?.[0];
        const topProductName = topProductId ? getProductName(parseInt(topProductId)) : '—';

        return { totalCustomers, totalOrders, totalRevenue, topCustomerName, topProductName };
    }, [state.customerPurchases, state.customers, state.fabricProducts]);

    // Derived Customer Data for the Master List
    const customerList = useMemo(() => {
        return state.customers.map(c => {
            const purchases = state.customerPurchases.filter(p => p.customerId === c.id);
            return {
                ...c,
                totalOrders: purchases.length,
                totalSpent: purchases.reduce((acc, p) => acc + p.totalAmount, 0)
            };
        });
    }, [state.customers, state.customerPurchases]);

    const handleViewDetails = (customer) => {
        setSelectedCustomer(customer);
        setIsDetailsModalOpen(true);
    };

    // Section 2 & 3: Filtering & Table Data
    const filteredTransactions = useMemo(() => {
        return state.customerPurchases.filter(p => {
            const matchesShop = !shopFilter || p.shopId === parseInt(shopFilter);
            const matchesCustomer = !customerFilter || p.customerId === parseInt(customerFilter);

            let matchesDate = true;
            if (dateRange.start) matchesDate = matchesDate && p.date >= dateRange.start;
            if (dateRange.end) matchesDate = matchesDate && p.date <= dateRange.end;

            return matchesShop && matchesCustomer && matchesDate;
        });
    }, [state.customerPurchases, shopFilter, customerFilter, dateRange]);

    const resetFilters = () => {
        setShopFilter('');
        setCustomerFilter('');
        setDateRange({ start: '', end: '' });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Management</h1>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        Unified directory, analytics, and transaction monitoring
                    </p>
                </div>
            </div>

            {/* Section 1: Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    label="Total Customers"
                    value={analytics.totalCustomers}
                    icon={Users}
                    colorClass="bg-blue-100 text-blue-700"
                />
                <StatCard
                    label="Total Orders"
                    value={analytics.totalOrders}
                    icon={ShoppingBag}
                    colorClass="bg-indigo-100 text-indigo-700"
                />
                <StatCard
                    label="Total Revenue"
                    value={`₹${analytics.totalRevenue.toLocaleString()}`}
                    icon={IndianRupee}
                    colorClass="bg-emerald-100 text-emerald-700"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Customer Directory Table */}
                <div className="xl:col-span-1 flex flex-col gap-6">
                    <div className="card overflow-hidden h-full">
                        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
                            <h2 className="text-sm font-bold flex items-center gap-2 text-slate-700 uppercase tracking-tighter">
                                <Users className="w-4 h-4 text-primary" /> Customer Directory
                            </h2>
                        </div>
                        <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-border">
                                    <tr>
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Orders</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {customerList.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-5 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-bold text-slate-800">{customer.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{getShopName(customer.shopId)}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{customer.totalOrders}</span>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <button
                                                    onClick={() => handleViewDetails(customer)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Filters & Transaction Table */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    {/* Section 2: Filter Panel */}
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-sm font-bold flex items-center gap-2 text-slate-700 uppercase tracking-tighter">
                                <Filter className="w-4 h-4 text-primary" /> Transaction Filters
                            </h2>
                            <button
                                onClick={resetFilters}
                                className="text-[10px] font-bold text-primary hover:text-primary/70 flex items-center gap-1 uppercase tracking-tight"
                            >
                                <X className="w-3 h-3" /> Reset
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Shop</label>
                                <select
                                    value={shopFilter}
                                    onChange={(e) => setShopFilter(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                >
                                    <option value="">All Shops</option>
                                    {state.shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Customer</label>
                                <select
                                    value={customerFilter}
                                    onChange={(e) => setCustomerFilter(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                >
                                    <option value="">All Customers</option>
                                    {state.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">From</label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">To</label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-muted/30 border border-border rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Transaction Table */}
                    <div className="card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                            <h2 className="text-sm font-bold flex items-center gap-2 text-slate-700 uppercase tracking-tighter">
                                <ShoppingBag className="w-4 h-4 text-primary" /> Active Monitoring
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{filteredTransactions.length} Line Items</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-border">
                                    <tr>
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredTransactions.length > 0 ? filteredTransactions.map((purchase) => (
                                        <tr key={purchase.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-5 py-3 text-[10px] font-medium text-slate-400 tabular-nums">{purchase.date}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-700">{getCustomerName(purchase.customerId)}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-slate-600 font-medium">{getProductName(purchase.fabricProductId)}</td>
                                            <td className="px-5 py-3 text-xs font-bold text-emerald-600">₹{purchase.totalAmount.toLocaleString()}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-5 py-20 text-center">
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Search className="w-8 h-8 opacity-10" />
                                                    <p className="text-xs font-medium">No transaction records match filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* View History Modal */}
            <CustomerDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                customer={selectedCustomer}
                purchases={selectedCustomer ? state.customerPurchases.filter(p => p.customerId === selectedCustomer.id) : []}
                products={state.fabricProducts}
            />
        </div>
    );
}
