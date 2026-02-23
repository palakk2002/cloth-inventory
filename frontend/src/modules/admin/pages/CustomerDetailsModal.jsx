import React from 'react';
import Modal from '../components/Modal';
import {
    User,
    Mail,
    ShoppingBag,
    IndianRupee,
    Calendar,
    Package,
    ArrowRight
} from 'lucide-react';

export default function CustomerDetailsModal({ isOpen, onClose, customer, purchases, products }) {
    if (!customer) return null;

    const totalOrders = purchases.length;
    const totalSpent = purchases.reduce((acc, p) => acc + p.totalAmount, 0);

    const getProductName = (id) => products.find(p => p.id === id)?.name || '—';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Customer Purchase History"
            size="large"
        >
            <div className="space-y-6">
                {/* Customer Info Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <User className="w-3 h-3" /> Name
                        </span>
                        <span className="text-sm font-bold text-slate-900">{customer.name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Contact
                        </span>
                        <span className="text-sm text-slate-600 truncate">{customer.contact || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-1 md:items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3" /> Total Orders
                        </span>
                        <span className="text-sm font-bold text-indigo-600">{totalOrders}</span>
                    </div>
                    <div className="flex flex-col gap-1 md:items-end">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" /> Total Spent
                        </span>
                        <span className="text-sm font-bold text-emerald-600">₹{totalSpent.toLocaleString()}</span>
                    </div>
                </div>

                {/* Purchase List Table */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700">
                        <Package className="w-4 h-4 text-primary" /> Purchase Breakdown
                    </h3>
                    <div className="overflow-hidden border border-border rounded-xl">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Product</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">Qty</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {purchases.length > 0 ? purchases.map((p) => (
                                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 text-xs text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3 opacity-50" /> {p.date}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-semibold text-slate-700">{getProductName(p.fabricProductId)}</td>
                                        <td className="px-4 py-3 text-xs font-bold text-slate-900 text-center">{p.quantity}</td>
                                        <td className="px-4 py-3 text-xs font-bold text-emerald-600 text-right">₹{p.totalAmount.toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-xs text-muted-foreground italic">No purchases recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-2"
                    >
                        Close History <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </Modal>
    );
}
