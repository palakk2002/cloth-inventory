import React from 'react';
import { CreditCard, Banknote, Smartphone, FileText, PauseCircle } from 'lucide-react';

const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Banknote, color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'upi', label: 'UPI', icon: Smartphone, color: 'text-violet-600 bg-violet-50 border-violet-200' },
    { value: 'card', label: 'Card', icon: CreditCard, color: 'text-blue-600 bg-blue-50 border-blue-200' },
];

export default function PaymentSection({ paymentMethod, onPaymentChange, onGenerateBill, onHoldBill, cartItemsCount }) {
    const isDisabled = cartItemsCount === 0;

    return (
        <div className="space-y-4">
            {/* Payment Method */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Payment Method</h3>
                <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((method) => {
                        const isSelected = paymentMethod === method.value;
                        return (
                            <button
                                key={method.value}
                                onClick={() => onPaymentChange(method.value)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-semibold ${isSelected
                                        ? method.color + ' ring-2 ring-offset-1 ring-primary/20'
                                        : 'bg-card border-border text-muted-foreground hover:border-primary/30'
                                    }`}
                            >
                                <method.icon className="w-5 h-5" />
                                {method.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={onHoldBill}
                    disabled={isDisabled}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-700 font-bold text-sm hover:bg-amber-100 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <PauseCircle className="w-4 h-4" />
                    Hold Bill
                </button>
                <button
                    onClick={onGenerateBill}
                    disabled={isDisabled}
                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <FileText className="w-4 h-4" />
                    Generate Bill
                </button>
            </div>
        </div>
    );
}
