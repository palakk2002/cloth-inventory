import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ShoppingCart, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Sales() {
    const { state, dispatch } = useAdmin();

    const [shopId, setShopId] = useState('');
    const [fabricProductId, setFabricProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const selectedProduct = state.fabricProducts.find(p => p.id === parseInt(fabricProductId));
    const totalAmount = selectedProduct ? selectedProduct.sellingPrice * parseFloat(quantity || 0) : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!shopId || !fabricProductId || !quantity || parseFloat(quantity) <= 0) {
            setError('Please fill all fields with valid values.');
            return;
        }

        const qty = parseInt(quantity);

        if (qty > (selectedProduct?.stock || 0)) {
            setError(`Insufficient stock! Available: ${selectedProduct.stock}, Requested: ${qty}`);
            return;
        }

        const shop = state.shops.find(s => s.id === parseInt(shopId));

        dispatch({
            type: 'ADD_SALE',
            payload: {
                shopId: parseInt(shopId),
                fabricProductId: selectedProduct.id,
                quantity: qty,
                totalAmount,
            }
        });

        setSuccess(`Sale recorded! ${qty} × ${selectedProduct.name} → ${shop?.name} (₹${totalAmount.toLocaleString()})`);
        setShopId('');
        setFabricProductId('');
        setQuantity('');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
                <p className="text-muted-foreground">Record and track product sales to shops</p>
            </div>

            {/* Sales Form */}
            <div className="card p-6">
                <h2 className="text-lg font-bold mb-6">New Sale Entry</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Select Shop</label>
                            <select
                                value={shopId}
                                onChange={(e) => { setShopId(e.target.value); setError(''); setSuccess(''); }}
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Choose a shop...</option>
                                {state.shops.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Select Product</label>
                            <select
                                value={fabricProductId}
                                onChange={(e) => { setFabricProductId(e.target.value); setError(''); setSuccess(''); }}
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Choose a product...</option>
                                {state.fabricProducts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                max={selectedProduct?.stock || 999}
                                value={quantity}
                                onChange={(e) => { setQuantity(e.target.value); setError(''); }}
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Enter quantity"
                            />
                        </div>
                    </div>

                    {/* Auto-display info */}
                    {selectedProduct && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Available Stock</p>
                                <p className={`text-sm font-bold ${selectedProduct.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                                    {selectedProduct.stock} pcs
                                </p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Selling Price</p>
                                <p className="text-sm font-bold">₹{selectedProduct.sellingPrice}</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Amount</p>
                                <p className="text-sm font-bold text-primary">₹{totalAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            {success}
                        </div>
                    )}

                    <button type="submit" className="btn-primary flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Record Sale
                    </button>
                </form>
            </div>

            {/* Sales Table */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-bold">Sales Records</h2>
                    <span className="text-sm font-medium text-muted-foreground">
                        Total: ₹{state.sales.reduce((acc, s) => acc + s.totalAmount, 0).toLocaleString()}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {state.sales.map((sale) => {
                                const shop = state.shops.find(s => s.id === sale.shopId);
                                const product = state.fabricProducts.find(p => p.id === sale.fabricProductId);
                                return (
                                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold">{shop?.name || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm px-2 py-1 bg-primary/5 text-primary rounded-md font-medium">
                                                {product?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">{sale.quantity} pcs</td>
                                        <td className="px-6 py-4 text-sm font-bold">₹{sale.totalAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{sale.date}</td>
                                    </tr>
                                );
                            })}
                            {state.sales.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        No sales recorded yet. Start selling! 💰
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
