import React from 'react';
import { useAdmin } from '../admin/context/AdminContext';
import { PackageCheck, AlertCircle, CheckCircle2, Receipt } from 'lucide-react';
import { useState } from 'react';
import InvoicePreview from '../admin/components/InvoicePreview';

export default function ReceiveStock() {
    const { state, dispatch } = useAdmin();
    const CURRENT_SHOP_ID = state.user?.shopId || 1;
    const [receivingDispatch, setReceivingDispatch] = useState(null);
    const [receivedQty, setReceivedQty] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    // Only show dispatches for this shop
    const shopDispatches = state.dispatches.filter(d => d.shopId === CURRENT_SHOP_ID);

    const getStatusBadge = (status) => {
        const styles = {
            'Pending': 'bg-yellow-100 text-yellow-700',
            'Partially Delivered': 'bg-blue-100 text-blue-700',
            'Delivered': 'bg-green-100 text-green-700',
        };
        return (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    const openReceive = (d) => {
        setReceivingDispatch(d);
        setReceivedQty('');
        setError('');
        setSuccess('');
    };

    const handleReceive = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const qty = parseInt(receivedQty);
        if (!qty || qty <= 0) { setError('Enter a valid quantity.'); return; }
        const remaining = receivingDispatch.quantitySent - receivingDispatch.quantityReceived;
        if (qty > remaining) { setError(`Cannot receive more than remaining (${remaining} pcs).`); return; }

        const diff = receivingDispatch.quantitySent - (receivingDispatch.quantityReceived + qty);

        try {
            // Real API Integration:
            // await dispatchService.receive(receivingDispatch.id, { 
            //     receivedQty: qty, 
            //     isPartial: qty < remaining 
            // });

            dispatch({
                type: 'RECEIVE_DISPATCH',
                payload: {
                    dispatchId: receivingDispatch.id,
                    receivedQty: qty,
                    isPartial: qty < remaining,
                    difference: remaining - qty
                }
            });

            setSuccess(`Received ${qty} pcs of ${receivingDispatch.productName}! Stock updated. ${qty < remaining ? `(Partial: ${remaining - qty} missing)` : ''}`);

            // Update local reference
            setReceivingDispatch({
                ...receivingDispatch,
                quantityReceived: receivingDispatch.quantityReceived + qty,
            });
        } catch (err) {
            setError('Failed to update receipt on server.');
        }
    };

    // Summary
    const pendingCount = shopDispatches.filter(d => d.status !== 'Delivered').length;
    const totalReceived = shopDispatches.reduce((a, d) => a + d.quantityReceived, 0);

    const handleViewInvoice = (dispatchId) => {
        const invoice = state.invoices.find(inv => inv.id === `INV-${dispatchId}`);
        if (invoice) {
            setSelectedInvoice(invoice);
            setIsInvoiceOpen(true);
        } else {
            alert("Invoice not found for this dispatch.");
        }
    };

    return (
        <div className="space-y-6">
            {state.loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-primary font-bold animate-pulse">Loading Dispatches...</p>
                    </div>
                </div>
            )}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Receive Stock</h1>
                <p className="text-muted-foreground">View dispatches from factory and confirm receiving</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <PackageCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Dispatches</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{shopDispatches.length}</h3>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending Receiving</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{pendingCount}</h3>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{totalReceived} pcs</h3>
                    </div>
                </div>
            </div>

            {/* Receive Form (if a dispatch is selected) */}
            {receivingDispatch && (
                <div className="card p-6 space-y-5 border-l-4 border-primary">
                    <h2 className="text-lg font-bold">Receiving: {receivingDispatch.productName}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted/30 rounded-xl border border-border">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Qty Sent</p>
                            <p className="text-sm font-bold">{receivingDispatch.quantitySent} pcs</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-xl border border-border">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Already Received</p>
                            <p className="text-sm font-bold text-green-600">{receivingDispatch.quantityReceived} pcs</p>
                        </div>
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Remaining</p>
                            <p className="text-sm font-bold text-primary">{receivingDispatch.quantitySent - receivingDispatch.quantityReceived} pcs</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-xl border border-border">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Dispatch Date</p>
                            <p className="text-sm font-bold">{receivingDispatch.dispatchDate}</p>
                        </div>
                    </div>

                    <form onSubmit={handleReceive} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Quantity Received</label>
                            <input type="number" required min="1"
                                max={receivingDispatch.quantitySent - receivingDispatch.quantityReceived}
                                value={receivedQty}
                                onChange={(e) => { setReceivedQty(e.target.value); setError(''); }}
                                className="w-full max-w-xs px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Enter received quantity" />
                        </div>

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

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setReceivingDispatch(null)}
                                className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-all">Cancel</button>
                            <button type="submit" className="btn-primary">Confirm Receive</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Dispatches Table */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-bold">Dispatches from Factory</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty Sent</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty Received</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Remaining</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dispatch Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {shopDispatches.map((d) => (
                                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold">{d.productName}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{d.quantitySent} pcs</td>
                                    <td className="px-6 py-4 text-sm font-medium text-green-600">{d.quantityReceived} pcs</td>
                                    <td className="px-6 py-4 text-sm font-medium text-orange-600">{d.quantitySent - d.quantityReceived} pcs</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{d.dispatchDate}</td>
                                    <td className="px-6 py-4">{getStatusBadge(d.status)}</td>
                                    <td className="px-6 py-4">
                                        {d.status !== 'Delivered' && (
                                            <button onClick={() => openReceive(d)}
                                                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                                                <PackageCheck className="w-4 h-4" /> Receive
                                            </button>
                                        )}
                                        {d.status === 'Delivered' && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full w-fit">VERIFIED FULL</span>
                                                <button
                                                    onClick={() => handleViewInvoice(d.id)}
                                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <Receipt className="w-3 h-3" /> View Invoice
                                                </button>
                                            </div>
                                        )}
                                        {d.status === 'Partially Delivered' && (
                                            <button onClick={() => openReceive(d)}
                                                className="text-sm font-semibold text-orange-600 hover:underline flex items-center gap-1">
                                                <PackageCheck className="w-4 h-4" /> Receive Rest
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {shopDispatches.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        No dispatches for this shop yet. 📦
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
                invoice={selectedInvoice}
            />
        </div>
    );
}
