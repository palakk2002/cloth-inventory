import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Factory, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Production() {
    const { state, dispatch } = useAdmin();

    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const selectedProduct = state.fabricProducts.find(p => p.id === parseInt(selectedProductId));
    const linkedFabric = selectedProduct ? state.fabrics.find(f => f.id === selectedProduct.fabricId) : null;
    const availableMeter = linkedFabric ? linkedFabric.totalMeter - linkedFabric.usedMeter : 0;
    const totalMeterRequired = selectedProduct ? selectedProduct.meterPerPiece * parseFloat(quantity || 0) : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedProductId || !quantity || parseFloat(quantity) <= 0) {
            setError('Please select a product and enter a valid quantity.');
            return;
        }

        if (totalMeterRequired > availableMeter) {
            setError(`Insufficient fabric! Required: ${totalMeterRequired} m, Available: ${availableMeter} m`);
            return;
        }

        dispatch({
            type: 'PRODUCE',
            payload: {
                fabricProductId: selectedProduct.id,
                fabricId: linkedFabric.id,
                quantity: parseInt(quantity),
                meterUsed: totalMeterRequired,
            }
        });

        setSuccess(`Successfully produced ${quantity} units of ${selectedProduct.name}!`);
        setSelectedProductId('');
        setQuantity('');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Production</h1>
                <p className="text-muted-foreground">Produce products from available fabric stock</p>
            </div>

            {/* Production Form */}
            <div className="card p-6">
                <h2 className="text-lg font-bold mb-6">New Production Entry</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Select Product</label>
                            <select
                                value={selectedProductId}
                                onChange={(e) => { setSelectedProductId(e.target.value); setError(''); setSuccess(''); }}
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Choose a product...</option>
                                {state.fabricProducts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Quantity to Produce</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => { setQuantity(e.target.value); setError(''); }}
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Enter quantity"
                            />
                        </div>
                    </div>

                    {/* Auto-display info */}
                    {selectedProduct && linkedFabric && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Linked Fabric</p>
                                <p className="text-sm font-bold">{linkedFabric.name}</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Available Meter</p>
                                <p className="text-sm font-bold text-green-600">{availableMeter} m</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Meter / Piece</p>
                                <p className="text-sm font-bold">{selectedProduct.meterPerPiece} m</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Meter Required</p>
                                <p className={`text-sm font-bold ${totalMeterRequired > availableMeter ? 'text-red-600' : 'text-primary'}`}>
                                    {totalMeterRequired} m
                                </p>
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
                        <Factory className="w-4 h-4" /> Produce Stock
                    </button>
                </form>
            </div>

            {/* Production Log */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-bold">Production Log</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fabric Used</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity Produced</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meter Used</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {state.productionLog.map((log) => {
                                const product = state.fabricProducts.find(p => p.id === log.fabricProductId);
                                const fabric = state.fabrics.find(f => f.id === log.fabricId);
                                return (
                                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold">{product?.name || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm px-2 py-1 bg-primary/5 text-primary rounded-md font-medium">
                                                {fabric?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold">{log.quantity} pcs</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{log.meterUsed} m</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{log.date}</td>
                                    </tr>
                                );
                            })}
                            {state.productionLog.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        No production entries yet. Start producing! 🏭
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
