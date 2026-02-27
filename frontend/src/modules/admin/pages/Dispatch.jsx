import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Send, AlertCircle, CheckCircle2, Search, Receipt } from 'lucide-react';
import InvoicePreview from '../components/InvoicePreview';

export default function Dispatch() {
    const { state, dispatch } = useAdmin();

    const [shopId, setShopId] = useState('');
    const [fabricProductId, setFabricProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [generatedInvoice, setGeneratedInvoice] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    const { addDispatch } = useAdmin();

    const selectedProduct = state.fabricProducts.find(p => p.id === fabricProductId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!shopId || !fabricProductId || !quantity || parseFloat(quantity) <= 0) {
            setError('Please fill all fields with valid values.');
            return;
        }

        const qty = parseInt(quantity);
        if (qty > (selectedProduct?.stock || 0)) {
            setError(`Insufficient factory stock! Available: ${selectedProduct.stock}, Requested: ${qty}`);
            return;
        }

        const shop = state.shops.find(s => (s.id === shopId || s._id === shopId));

        const res = await addDispatch({
            storeId: shopId,
            products: [
                { productId: selectedProduct.id || selectedProduct._id, quantity: qty }
            ]
        });

        if (res.success) {
            const invoiceData = {
                id: `INV-${res.dispatchId || Date.now()}`,
                shopName: shop?.name || 'Shop',
                productName: selectedProduct.name,
                fabricType: selectedProduct.fabricType || 'N/A',
                quantity: qty,
                pricePerUnit: selectedProduct.sellingPrice || 0,
                total: qty * (selectedProduct.sellingPrice || 0),
                date: new Date().toISOString().split('T')[0]
            };

            setGeneratedInvoice(invoiceData);
            setIsInvoiceOpen(true);
            setSuccess(`Dispatched ${qty} × ${selectedProduct.name} → ${shop?.name}`);
            setShopId('');
            setFabricProductId('');
            setQuantity('');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'PENDING': 'bg-yellow-100 text-yellow-700',
            'Pending': 'bg-yellow-100 text-yellow-700',
            'SHIPPED': 'bg-blue-100 text-blue-700',
            'RECEIVED': 'bg-green-100 text-green-700',
            'Delivered': 'bg-green-100 text-green-700',
        };
        return (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    const filteredDispatches = state.dispatches.filter(d =>
        (d.shopName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.productName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Summary stats
    const totalDispatched = state.dispatches.reduce((a, d) => a + (d.quantitySent || d.quantity || 0), 0);
    const totalDelivered = state.dispatches.filter(d => d.status === 'RECEIVED' || d.status === 'Delivered').length;
    const pendingCount = state.dispatches.filter(d => d.status === 'PENDING' || d.status === 'Pending').length;

    return (
        <div className="space-y-6">
            {state.loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-primary font-bold animate-pulse">Checking Inventory & Dispatches...</p>
                    </div>
                </div>
            )}

            {state.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p>{state.error}</p>
                </div>
            )}

            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dispatch</h1>
                <p className="text-muted-foreground">Dispatch finished products to your shops</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Send className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Dispatched</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{totalDispatched} pcs</h3>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{totalDelivered}</h3>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{pendingCount}</h3>
                    </div>
                </div>
            </div>

            {/* Dispatch Form */}
            <div className="card p-6">
                <h2 className="text-lg font-bold mb-6">New Dispatch Entry</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Select Shop</label>
                            <select value={shopId}
                                onChange={(e) => { setShopId(e.target.value); setError(''); setSuccess(''); }}
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20">
                                <option value="">Choose a shop...</option>
                                {state.shops.map(s => (
                                    <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Select Product</label>
                            <select value={fabricProductId}
                                onChange={(e) => { setFabricProductId(e.target.value); setError(''); setSuccess(''); }}
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20">
                                <option value="">Choose a product...</option>
                                {state.fabricProducts.map(p => (
                                    <option key={p.id || p._id} value={p.id || p._id}>{p.name} (Stock: {p.stock || p.factoryStock})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Quantity to Send</label>
                            <input type="number" min="1" max={selectedProduct?.stock || 999}
                                value={quantity}
                                onChange={(e) => { setQuantity(e.target.value); setError(''); }}
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Enter quantity" />
                        </div>
                    </div>

                    {selectedProduct && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Available Factory Stock</p>
                                <p className={`text-sm font-bold ${selectedProduct.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                                    {selectedProduct.stock} pcs
                                </p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Selling Price</p>
                                <p className="text-sm font-bold">₹{selectedProduct.sellingPrice}</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
                        </div>
                    )}

                    <button type="submit" className="btn-primary flex items-center gap-2">
                        <Send className="w-4 h-4" /> Dispatch
                    </button>
                </form>
            </div>

            {/* Dispatches Table */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="text" placeholder="Search dispatches..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                        Total: {state.dispatches.length} dispatches
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty Sent</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty Received</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dispatch Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredDispatches.map((d) => (
                                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold">{d.shopName}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm px-2 py-1 bg-primary/5 text-primary rounded-md font-medium">{d.productName}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">{d.quantitySent} pcs</td>
                                    <td className="px-6 py-4 text-sm font-medium text-green-600">{d.quantityReceived} pcs</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{d.dispatchDate}</td>
                                    <td className="px-6 py-4">{getStatusBadge(d.status)}</td>
                                </tr>
                            ))}
                            {filteredDispatches.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        No dispatches yet. Start dispatching! 🚚
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Invoice Preview Modal */}
            <InvoicePreview
                isOpen={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
                invoice={generatedInvoice}
            />
        </div>
    );
}
