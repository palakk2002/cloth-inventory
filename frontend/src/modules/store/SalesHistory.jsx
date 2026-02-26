import React, { useState, useMemo } from 'react';
import { useAdmin } from '../admin/context/AdminContext';
import {
    Search, Calendar, Filter, Eye, X, FileText,
    IndianRupee, ShoppingBag, CreditCard, Banknote, Smartphone
} from 'lucide-react';

const CURRENT_SHOP_ID = 1;

const paymentIcons = { cash: Banknote, upi: Smartphone, card: CreditCard };
const paymentLabels = { cash: 'Cash', upi: 'UPI', card: 'Card' };

function BillDetailModal({ isOpen, onClose, bill }) {
    if (!isOpen || !bill) return null;
    const PayIcon = paymentIcons[bill.paymentMethod] || Banknote;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-[#1E3A56] text-white p-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{bill.billId}</h2>
                            <p className="text-xs text-white/60">{bill.date} • {bill.time || ''}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Customer & Payment Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Customer</p>
                            <p className="font-bold">{bill.customerName}</p>
                            {bill.customerPhone && <p className="text-xs text-muted-foreground">{bill.customerPhone}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground font-medium">Payment</p>
                            <div className="flex items-center justify-end gap-1.5">
                                <PayIcon className="w-4 h-4 text-primary" />
                                <p className="font-bold">{paymentLabels[bill.paymentMethod]}</p>
                            </div>
                            <p className="text-xs text-green-600 font-semibold">{bill.paymentStatus || 'Paid'}</p>
                        </div>
                        {bill.transactionId && (
                            <div className="col-span-2">
                                <p className="text-xs text-muted-foreground font-medium">Transaction ID</p>
                                <p className="text-sm font-mono font-semibold text-primary">{bill.transactionId}</p>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-border" />

                    {/* Items */}
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
                            {bill.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-2.5 font-semibold text-sm">{item.productName}</td>
                                    <td className="py-2.5 text-center font-medium">{item.quantity}</td>
                                    <td className="py-2.5 text-right font-medium">₹{(item.pricePerUnit || 0).toLocaleString()}</td>
                                    <td className="py-2.5 text-right font-bold">₹{(item.total || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Divider */}
                    <div className="border-t border-dashed border-border" />

                    {/* Totals */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-semibold">₹{(bill.subtotal || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">GST (5%)</span>
                            <span className="font-semibold">₹{(bill.gst || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        {(bill.discount || 0) > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span className="font-semibold">- ₹{bill.discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-3 border-t border-border text-base">
                            <span className="font-bold">Grand Total</span>
                            <span className="font-bold text-primary text-lg">₹{bill.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SalesHistory() {
    const { state } = useAdmin();
    const CURRENT_SHOP_ID = state.user?.shopId || 1;
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);

    // Only this shop's bills
    const shopBills = state.storeBills.filter(b => b.shopId === CURRENT_SHOP_ID);

    // Filtered bills
    const filteredBills = useMemo(() => {
        let bills = [...shopBills].sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return b.id - a.id;
        });

        if (dateFilter) {
            bills = bills.filter(b => b.date === dateFilter);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            bills = bills.filter(b =>
                b.billId.toLowerCase().includes(term) ||
                b.customerName.toLowerCase().includes(term) ||
                (b.customerPhone && b.customerPhone.includes(term)) ||
                b.items.some(item => item.productName.toLowerCase().includes(term))
            );
        }

        return bills;
    }, [shopBills, dateFilter, searchTerm]);

    // Summary stats
    const totalRevenue = filteredBills.reduce((a, b) => a + b.totalAmount, 0);
    const totalOrders = filteredBills.length;
    const totalItemsSold = filteredBills.reduce((a, b) => a + b.items.reduce((x, i) => x + i.quantity, 0), 0);

    const summaryCards = [
        { label: 'Total Bills', value: totalOrders, icon: FileText, color: 'bg-blue-100 text-blue-700' },
        { label: 'Revenue', value: `₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: IndianRupee, color: 'bg-green-100 text-green-700' },
        { label: 'Items Sold', value: totalItemsSold, icon: ShoppingBag, color: 'bg-purple-100 text-purple-700' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {state.loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-primary font-bold animate-pulse">Loading Sales Records...</p>
                    </div>
                </div>
            )}
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Sales History</h1>
                <p className="text-muted-foreground">View all sales transactions for this shop</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {summaryCards.map((card) => (
                    <div key={card.label} className="bg-card border border-border rounded-xl shadow-sm p-4 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                        <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center shrink-0`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                            <h3 className="text-xl font-bold tracking-tight mt-0.5">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold">Filters</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Search Bill ID, Customer, Product..."
                        />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
                {(searchTerm || dateFilter) && (
                    <button
                        onClick={() => { setSearchTerm(''); setDateFilter(''); }}
                        className="mt-3 text-xs font-semibold text-primary hover:underline"
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Sales Table */}
            <div className="card overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold">Sales Records</h2>
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                            {filteredBills.length} bills
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bill ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredBills.map((bill) => {
                                const PayIcon = paymentIcons[bill.paymentMethod] || Banknote;
                                return (
                                    <tr key={bill.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-primary">{bill.billId}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium">{bill.date}</p>
                                            {bill.time && <p className="text-xs text-muted-foreground">{bill.time}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold">{bill.customerName}</p>
                                            {bill.customerPhone && <p className="text-xs text-muted-foreground">{bill.customerPhone}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold">₹{bill.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <PayIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">{paymentLabels[bill.paymentMethod]}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedBill(bill)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-all"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredBills.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        No sales records found. {searchTerm || dateFilter ? 'Try adjusting your filters.' : 'Generate some bills first!'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            <BillDetailModal
                isOpen={!!selectedBill}
                onClose={() => setSelectedBill(null)}
                bill={selectedBill}
            />
        </div>
    );
}
