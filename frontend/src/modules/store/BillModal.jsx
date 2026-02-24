import React, { useEffect } from 'react';
import { X, Printer, CheckCircle2, Store, Receipt } from 'lucide-react';

export default function BillModal({ isOpen, onClose, billData }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !billData) return null;

    const paymentLabels = { cash: 'Cash', upi: 'UPI', card: 'Card' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-[#1E3A56] text-white p-6 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Store className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Cloth Inventory</h2>
                    <p className="text-xs text-white/60 uppercase tracking-widest mt-1">Tax Invoice</p>
                </div>

                {/* Bill Info */}
                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p className="text-muted-foreground">Bill No.</p>
                            <p className="font-bold text-sm">{billData.billId || billData.billNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground">Date & Time</p>
                            <p className="font-bold text-sm">{billData.dateTime}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Customer</p>
                            <p className="font-bold text-sm">{billData.customerName || 'Walk-in Customer'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground">Staff</p>
                            <p className="font-bold text-sm">{billData.staffName}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Payment</p>
                            <p className="font-bold text-sm">{paymentLabels[billData.paymentMethod] || billData.paymentMethod}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-border" />

                    {/* Items */}
                    <div>
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="pb-2 font-semibold text-muted-foreground uppercase tracking-wider">Item</th>
                                    <th className="pb-2 font-semibold text-muted-foreground uppercase tracking-wider text-center">Qty</th>
                                    <th className="pb-2 font-semibold text-muted-foreground uppercase tracking-wider text-right">Price</th>
                                    <th className="pb-2 font-semibold text-muted-foreground uppercase tracking-wider text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {billData.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2.5">
                                            <p className="font-semibold text-sm">{item.productName || item.name}</p>
                                        </td>
                                        <td className="py-2.5 text-center font-medium">{item.quantity}</td>
                                        <td className="py-2.5 text-right font-medium">₹{(item.pricePerUnit || item.price || 0).toLocaleString()}</td>
                                        <td className="py-2.5 text-right font-bold">₹{(item.total || (item.price || item.pricePerUnit || 0) * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-border" />

                    {/* Totals */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-semibold">₹{billData.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">GST (5%)</span>
                            <span className="font-semibold">₹{billData.gst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        {billData.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span className="font-semibold">- ₹{billData.discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-3 border-t border-border text-base">
                            <span className="font-bold">Grand Total</span>
                            <span className="font-bold text-primary text-lg">₹{billData.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Thank You */}
                    <div className="text-center pt-2">
                        <div className="inline-flex items-center gap-1.5 text-green-600 mb-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-bold text-sm">Payment Received</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Thank you for shopping with us!</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">Visit again · Exchange within 7 days with bill</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => window.print()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-border rounded-xl font-semibold text-sm hover:bg-muted transition-all"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
