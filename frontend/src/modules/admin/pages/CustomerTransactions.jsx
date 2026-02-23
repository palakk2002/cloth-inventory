import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { ShoppingBag, FileText, Calendar, Store, User, Package } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function CustomerTransactions() {
    const { state } = useAdmin();

    const getCustomerName = (id) => state.customers.find(c => c.id === id)?.name || '—';
    const getShopName = (id) => state.shops.find(s => s.id === id)?.name || '—';
    const getProductName = (id) => state.fabricProducts.find(p => p.id === id)?.name || '—';

    // Stats for the header
    const totalTransactions = state.customerPurchases.length;
    const totalTransactionValue = state.customerPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
    const totalQtySold = state.customerPurchases.reduce((acc, p) => acc + p.quantity, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Customer Transactions</h1>
                <p className="text-muted-foreground">View and track all customer purchase history (View Only)</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Transactions"
                    value={totalTransactions}
                    icon={FileText}
                    colorClass="bg-blue-100 text-blue-700"
                />
                <StatCard
                    label="Total Value"
                    value={`₹${totalTransactionValue.toLocaleString()}`}
                    icon={ShoppingBag}
                    colorClass="bg-emerald-100 text-emerald-700"
                />
                <StatCard
                    label="Total Qty Sold"
                    value={`${totalQtySold} Units`}
                    icon={Package}
                    colorClass="bg-orange-100 text-orange-700"
                />
            </div>

            {/* Transactions Table */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary" /> Transaction History
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full font-medium">
                        <Calendar className="w-4 h-4" /> All Time
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {state.customerPurchases.length > 0 ? state.customerPurchases.map(purchase => (
                                <tr key={purchase.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                                <Store className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium">{getShopName(purchase.shopId)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                <User className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{getCustomerName(purchase.customerId)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{getProductName(purchase.fabricProductId)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{purchase.quantity}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">₹{purchase.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground tabular-nums">{purchase.date}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground font-medium">No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
