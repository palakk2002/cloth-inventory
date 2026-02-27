import React from 'react';
import { useAdmin } from '../admin/context/AdminContext';
import { PackageCheck, AlertCircle, CheckCircle2, Receipt } from 'lucide-react';
import { useState } from 'react';
import InvoicePreview from '../admin/components/InvoicePreview';

export default function ReceiveStock() {
    const { state, receiveDispatch } = useAdmin();
    const [receivingDispatch, setReceivingDispatch] = useState(null);
    const [receivedQty, setReceivedQty] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const CURRENT_SHOP_ID = state.user?.shopId || state.user?.storeId || state.user?.id || state.user?._id;
    // Only show dispatches for this shop
    const shopDispatches = state.dispatches.filter(d => String(d.shopId) === String(CURRENT_SHOP_ID) || String(d.storeId) === String(CURRENT_SHOP_ID));
    console.log("ReceiveStock Debug:", { CURRENT_SHOP_ID, shopDispatches, allDispatches: state.dispatches });

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

    const openReceive = (d) => {
        setReceivingDispatch(d);
        setReceivedQty(d.quantitySent - d.quantityReceived);
        setError('');
        setSuccess('');
    };

    const handleReceive = async (dispatchId) => {
        setError('');
        setSuccess('');

        try {
            const res = await receiveDispatch(dispatchId);
            if (res.success) {
                setSuccess(`Received successfully! Stock updated.`);
                setReceivingDispatch(null);
            }
        } catch (err) {
            setError('Failed to update receipt on server.');
        }
    };

    // Summary
    const pendingCount = shopDispatches.filter(d => d.status !== 'RECEIVED' && d.status !== 'Delivered').length;
    const totalReceived = shopDispatches.filter(d => d.status === 'RECEIVED' || d.status === 'Delivered').reduce((a, d) => a + d.quantitySent, 0);

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
                        <p className="text-sm font-medium text-muted-foreground">Total Received Items</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{totalReceived} pcs</h3>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal/UI */}
            {receivingDispatch && (
                <div className="card p-6 border-l-4 border-primary bg-primary/[0.02]">
                    <h2 className="text-lg font-bold mb-4 text-primary">Confirm Receipt of {receivingDispatch.productName}</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        You are confirming receipt of <span className="font-bold text-foreground">{receivingDispatch.quantitySent}</span> pieces sent on <span className="font-bold text-foreground">{receivingDispatch.dispatchDate}</span>.
                        This operation will update your shop's inventory immediately.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleReceive(receivingDispatch._id || receivingDispatch.id)}
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                        >
                            Confirm & Update Stock
                        </button>
                        <button
                            onClick={() => setReceivingDispatch(null)}
                            className="px-6 py-2.5 border border-border font-bold rounded-xl hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                    </div>
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
                                        {d.status !== 'RECEIVED' && (
                                            <button onClick={() => openReceive(d)}
                                                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                                                <PackageCheck className="w-4 h-4" /> Receive
                                            </button>
                                        )}
                                        {d.status === 'RECEIVED' && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full w-fit">VERIFIED FULL</span>
                                                <button
                                                    onClick={() => handleViewInvoice(d._id || d.id)}
                                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <Receipt className="w-3 h-3" /> View Invoice
                                                </button>
                                            </div>
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
