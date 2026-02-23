import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import Modal from '../components/Modal';
import { FileText, Search } from 'lucide-react';

export default function CustomerReports() {
    const { state } = useAdmin();
    const [filterShop, setFilterShop] = useState('');
    const [filterCustomer, setFilterCustomer] = useState('');
    const [filterProduct, setFilterProduct] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const getCustomerName = (id) => state.customers.find(c => c.id === id)?.name || '—';
    const getShopName = (id) => state.shops.find(s => s.id === id)?.name || '—';
    const getProductName = (id) => state.fabricProducts.find(p => p.id === id)?.name || '—';

    // Apply filters
    let filtered = [...state.customerPurchases];
    if (filterShop) filtered = filtered.filter(p => p.shopId === parseInt(filterShop));
    if (filterCustomer) filtered = filtered.filter(p => p.customerId === parseInt(filterCustomer));
    if (filterProduct) filtered = filtered.filter(p => p.fabricProductId === parseInt(filterProduct));

    // Customer detail modal data
    const getCustomerDetail = (customerId) => {
        const customer = state.customers.find(c => c.id === customerId);
        if (!customer) return null;
        const purchases = state.customerPurchases.filter(p => p.customerId === customerId);
        const totalAmount = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
        const totalQty = purchases.reduce((acc, p) => acc + p.quantity, 0);

        // Product-wise breakdown
        const productBreakdown = {};
        purchases.forEach(p => {
            if (!productBreakdown[p.fabricProductId]) {
                productBreakdown[p.fabricProductId] = { name: getProductName(p.fabricProductId), qty: 0, amount: 0 };
            }
            productBreakdown[p.fabricProductId].qty += p.quantity;
            productBreakdown[p.fabricProductId].amount += p.totalAmount;
        });

        return { customer, totalPurchases: purchases.length, totalAmount, totalQty, productBreakdown: Object.values(productBreakdown) };
    };

    const customerDetail = selectedCustomer ? getCustomerDetail(selectedCustomer) : null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Customer Reports</h1>
                <p className="text-muted-foreground">Detailed analysis of customer purchase history</p>
            </div>

            {/* Filters */}
            <div className="card p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" /> Filters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Filter by Shop</label>
                        <select
                            value={filterShop}
                            onChange={(e) => setFilterShop(e.target.value)}
                            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="">All Shops</option>
                            {state.shops.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Filter by Customer</label>
                        <select
                            value={filterCustomer}
                            onChange={(e) => setFilterCustomer(e.target.value)}
                            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="">All Customers</option>
                            {state.customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Filter by Product</label>
                        <select
                            value={filterProduct}
                            onChange={(e) => setFilterProduct(e.target.value)}
                            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="">All Products</option>
                            {state.fabricProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Report Table */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" /> Purchase Records
                    </h2>
                    <span className="text-sm text-muted-foreground font-medium">{filtered.length} records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map(purchase => (
                                <tr key={purchase.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedCustomer(purchase.customerId)}
                                            className="text-sm font-bold text-primary hover:underline cursor-pointer"
                                        >
                                            {getCustomerName(purchase.customerId)}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm px-2 py-1 bg-primary/5 text-primary rounded-md font-medium">{getShopName(purchase.shopId)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{getProductName(purchase.fabricProductId)}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{purchase.quantity}</td>
                                    <td className="px-6 py-4 text-sm font-bold">₹{purchase.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{purchase.date}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground font-medium">No records match the selected filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Detail Modal */}
            <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title="Customer Purchase Details">
                {customerDetail && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-muted/50 rounded-lg p-4 text-center">
                                <p className="text-xs text-muted-foreground font-medium">Total Purchases</p>
                                <p className="text-xl font-bold mt-1">{customerDetail.totalPurchases}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-4 text-center">
                                <p className="text-xs text-muted-foreground font-medium">Total Qty</p>
                                <p className="text-xl font-bold mt-1">{customerDetail.totalQty} pcs</p>
                            </div>
                            <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/10">
                                <p className="text-xs text-primary font-medium">Total Spent</p>
                                <p className="text-xl font-bold mt-1 text-primary">₹{customerDetail.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="border border-border rounded-lg p-4">
                            <h4 className="text-sm font-bold mb-2">{customerDetail.customer.name}</h4>
                            <p className="text-xs text-muted-foreground">Contact: {customerDetail.customer.contact}</p>
                            <p className="text-xs text-muted-foreground">Shop: {getShopName(customerDetail.customer.shopId)}</p>
                            {customerDetail.customer.address && (
                                <p className="text-xs text-muted-foreground">Address: {customerDetail.customer.address}</p>
                            )}
                        </div>

                        {/* Product Breakdown */}
                        <div>
                            <h4 className="text-sm font-bold mb-3">Product-wise Breakdown</h4>
                            <table className="w-full text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Product</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Qty</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {customerDetail.productBreakdown.map((item, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                                            <td className="px-4 py-3 text-sm">{item.qty}</td>
                                            <td className="px-4 py-3 text-sm font-bold">₹{item.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
