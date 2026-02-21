import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import StatusBadge from '../components/StatusBadge';
import { Box, ArrowUpRight, ArrowDownLeft, History, Search } from 'lucide-react';

export default function StockManagement() {
    const { state, dispatch } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [adjustment, setAdjustment] = useState({
        productId: '',
        variantId: '',
        type: 'IN',
        quantity: 1
    });

    const selectedProduct = state.products.find(p => p.id === parseInt(adjustment.productId));
    const selectedVariant = selectedProduct?.variants.find(v => v.id === parseInt(adjustment.variantId));

    const handleAdjust = (e) => {
        e.preventDefault();
        if (!adjustment.productId || !adjustment.variantId) return;

        dispatch({
            type: 'ADJUST_STOCK',
            payload: {
                productId: parseInt(adjustment.productId),
                variantId: parseInt(adjustment.variantId),
                type: adjustment.type,
                quantity: parseInt(adjustment.quantity)
            }
        });

        // Reset quantity
        setAdjustment(prev => ({ ...prev, quantity: 1 }));
        alert('Stock adjusted successfully!');
    };

    const filteredHistory = state.stockHistory.filter(h => {
        const product = state.products.find(p => p.id === h.productId);
        return product?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Stock Management</h1>
                <p className="text-muted-foreground">Adjust stock levels and view inventory history</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Adjustment Form */}
                <div className="card p-6 h-fit sticky top-24">
                    <div className="flex items-center gap-2 mb-6">
                        <Box className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold">Quick Adjustment</h2>
                    </div>

                    <form onSubmit={handleAdjust} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Select Product</label>
                            <select
                                value={adjustment.productId}
                                onChange={(e) => setAdjustment({ ...adjustment, productId: e.target.value, variantId: '' })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            >
                                <option value="">Select Product</option>
                                {state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Select Variant</label>
                            <select
                                value={adjustment.variantId}
                                disabled={!adjustment.productId}
                                onChange={(e) => setAdjustment({ ...adjustment, variantId: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
                                required
                            >
                                <option value="">Select Variant</option>
                                {selectedProduct?.variants.map(v => (
                                    <option key={v.id} value={v.id}>{v.size} / {v.color} (Current: {v.stock})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Type</label>
                                <div className="flex p-1 bg-muted rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustment({ ...adjustment, type: 'IN' })}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${adjustment.type === 'IN' ? 'bg-white text-green-600 shadow-sm' : 'text-muted-foreground'}`}
                                    >
                                        Stock IN
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAdjustment({ ...adjustment, type: 'OUT' })}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${adjustment.type === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-muted-foreground text-red-600/50'}`}
                                    >
                                        Stock OUT
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Quantity</label>
                                <input
                                    type="number" min="1"
                                    value={adjustment.quantity}
                                    onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })}
                                    className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full btn-primary mt-4">
                            Apply Adjustment
                        </button>
                    </form>
                </div>

                {/* History Table */}
                <div className="lg:col-span-2 card overflow-hidden">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold">Stock History</h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search history..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-1.5 bg-muted border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product / Variant</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredHistory.map((h) => {
                                    const product = state.products.find(p => p.id === h.productId);
                                    const variant = product?.variants.find(v => v.id === h.variantId);

                                    return (
                                        <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{product?.name}</span>
                                                    <span className="text-xs text-muted-foreground">{variant?.size} / {variant?.color}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-1.5 text-xs font-bold ${h.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {h.type === 'IN' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                                    {h.type}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold">{h.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{h.date}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
