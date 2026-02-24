import React from 'react';
import { Receipt } from 'lucide-react';

export default function BillingSummary({ subtotal, gst, discount, grandTotal, onDiscountChange }) {
    return (
        <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Billing Summary</h3>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">GST (5%)</span>
                    <span className="font-semibold">₹{gst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">₹</span>
                        <input
                            type="number"
                            min="0"
                            value={discount}
                            onChange={(e) => onDiscountChange(Math.max(0, Number(e.target.value)))}
                            className="w-20 text-right py-1 px-2 border border-border rounded-md text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-base font-bold">Grand Total</span>
                        <span className="text-xl font-bold text-primary">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
