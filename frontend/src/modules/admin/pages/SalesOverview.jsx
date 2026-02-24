import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
    IndianRupee, Store, Calendar, Filter, Eye, X, FileText,
    ShoppingBag, CreditCard, Banknote, Smartphone, TrendingUp, BarChart3, Package
} from 'lucide-react';

const paymentIcons = { cash: Banknote, upi: Smartphone, card: CreditCard };
const paymentLabels = { cash: 'Cash', upi: 'UPI', card: 'Card' };

function BillDetailModal({ isOpen, onClose, bill }) {
    if (!isOpen || !bill) return null;
    const PayIcon = paymentIcons[bill.paymentMethod] || Banknote;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
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
                            <p className="text-xs text-white/60">{bill.shopName} • {bill.date} {bill.time || ''}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-5">
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
                    <div className="border-t border-dashed border-border" />
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
                    <div className="border-t border-dashed border-border" />
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">₹{(bill.subtotal || 0).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">GST (5%)</span><span className="font-semibold">₹{(bill.gst || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                        {(bill.discount || 0) > 0 && (
                            <div className="flex justify-between text-green-600"><span>Discount</span><span className="font-semibold">- ₹{bill.discount.toLocaleString()}</span></div>
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

export default function SalesOverview() {
    const { state } = useAdmin();
    const [shopFilter, setShopFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);

    const allBills = state.storeBills;
    const shops = state.shops || [];

    // Filtered bills
    const filteredBills = useMemo(() => {
        let bills = [...allBills].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

        if (shopFilter) bills = bills.filter(b => b.shopId === parseInt(shopFilter));
        if (dateFrom) bills = bills.filter(b => b.date >= dateFrom);
        if (dateTo) bills = bills.filter(b => b.date <= dateTo);

        return bills;
    }, [allBills, shopFilter, dateFrom, dateTo]);

    // ---- Analytics ----
    const totalRevenue = filteredBills.reduce((a, b) => a + b.totalAmount, 0);
    const totalOrders = filteredBills.length;
    const totalItemsSold = filteredBills.reduce((a, b) => a + b.items.reduce((x, i) => x + i.quantity, 0), 0);

    // Shop-wise revenue
    const shopRevenue = useMemo(() => {
        const map = {};
        filteredBills.forEach(bill => {
            if (!map[bill.shopId]) map[bill.shopId] = { shopName: bill.shopName, revenue: 0, orders: 0, items: 0 };
            map[bill.shopId].revenue += bill.totalAmount;
            map[bill.shopId].orders += 1;
            map[bill.shopId].items += bill.items.reduce((a, i) => a + i.quantity, 0);
        });
        return Object.entries(map).map(([id, data]) => ({ shopId: parseInt(id), ...data }));
    }, [filteredBills]);

    // Date-wise revenue
    const dateRevenue = useMemo(() => {
        const map = {};
        filteredBills.forEach(bill => {
            if (!map[bill.date]) map[bill.date] = { date: bill.date, revenue: 0, orders: 0 };
            map[bill.date].revenue += bill.totalAmount;
            map[bill.date].orders += 1;
        });
        return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
    }, [filteredBills]);

    // Product-wise sales
    const productSales = useMemo(() => {
        const map = {};
        filteredBills.forEach(bill => {
            bill.items.forEach(item => {
                const key = item.productName;
                if (!map[key]) map[key] = { productName: key, totalQty: 0, totalRevenue: 0 };
                map[key].totalQty += item.quantity;
                map[key].totalRevenue += item.total || (item.pricePerUnit * item.quantity);
            });
        });
        return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue);
    }, [filteredBills]);

    // Summary Cards
    const summaryCards = [
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: IndianRupee, color: 'bg-green-100 text-green-700' },
        { label: 'Total Orders', value: totalOrders, icon: FileText, color: 'bg-blue-100 text-blue-700' },
        { label: 'Items Sold', value: totalItemsSold, icon: ShoppingBag, color: 'bg-purple-100 text-purple-700' },
        { label: 'Active Shops', value: shopRevenue.length, icon: Store, color: 'bg-orange-100 text-orange-700' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sales Overview</h1>
                    <p className="text-muted-foreground">All shop sales analytics and bill records</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {summaryCards.map((card) => (
                    <div key={card.label} className="card p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                        <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center shrink-0`}>
                            <card.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                            <h3 className="text-2xl font-bold mt-1 tracking-tight">{card.value}</h3>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select
                        value={shopFilter}
                        onChange={(e) => setShopFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                        <option value="">All Shops</option>
                        {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        {/* Also list shops from bills if shops array is empty */}
                        {shops.length === 0 && [...new Set(allBills.map(b => JSON.stringify({ id: b.shopId, name: b.shopName })))].map(s => {
                            const shop = JSON.parse(s);
                            return <option key={shop.id} value={shop.id}>{shop.name}</option>;
                        })}
                    </select>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="From Date"
                        />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="To Date"
                        />
                    </div>
                </div>
                {(shopFilter || dateFrom || dateTo) && (
                    <button onClick={() => { setShopFilter(''); setDateFrom(''); setDateTo(''); }}
                        className="mt-3 text-xs font-semibold text-primary hover:underline">
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Shop-wise Revenue */}
            <div className="card overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/30 flex items-center gap-2">
                    <Store className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-bold">Shop-wise Revenue</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items Sold</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {shopRevenue.map((shop) => (
                                <tr key={shop.shopId} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold">{shop.shopName}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{shop.orders}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{shop.items} pcs</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-700">₹{shop.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                            {shopRevenue.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No data found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Date-wise Revenue & Product-wise Sales – side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Date-wise Revenue */}
                <div className="card overflow-hidden">
                    <div className="p-5 border-b border-border bg-muted/30 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <h2 className="text-base font-bold">Date-wise Revenue</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {dateRevenue.map((d) => (
                                    <tr key={d.date} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-3 text-sm font-bold">{d.date}</td>
                                        <td className="px-6 py-3 text-sm font-medium">{d.orders}</td>
                                        <td className="px-6 py-3 text-sm font-bold text-green-700">₹{d.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                                {dateRevenue.length === 0 && (
                                    <tr><td colSpan="3" className="px-6 py-8 text-center text-muted-foreground">No data found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Product-wise Sales */}
                <div className="card overflow-hidden">
                    <div className="p-5 border-b border-border bg-muted/30 flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        <h2 className="text-base font-bold">Product-wise Sales</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty Sold</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {productSales.map((p) => (
                                    <tr key={p.productName} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-3 text-sm font-bold">{p.productName}</td>
                                        <td className="px-6 py-3 text-sm font-medium">{p.totalQty} pcs</td>
                                        <td className="px-6 py-3 text-sm font-bold text-green-700">₹{p.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                                {productSales.length === 0 && (
                                    <tr><td colSpan="3" className="px-6 py-8 text-center text-muted-foreground">No data found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* All Bills Table */}
            <div className="card overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <h2 className="text-base font-bold">All Bills</h2>
                    </div>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        {filteredBills.length} bills
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bill ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop</th>
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
                                        <td className="px-6 py-4"><span className="text-sm font-bold text-primary">{bill.billId}</span></td>
                                        <td className="px-6 py-4 text-sm font-medium">{bill.shopName}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium">{bill.date}</p>
                                            {bill.time && <p className="text-xs text-muted-foreground">{bill.time}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold">{bill.customerName}</td>
                                        <td className="px-6 py-4 text-sm font-bold">₹{bill.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <PayIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">{paymentLabels[bill.paymentMethod]}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => setSelectedBill(bill)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-all">
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredBills.length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-muted-foreground font-medium">No bills found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            <BillDetailModal isOpen={!!selectedBill} onClose={() => setSelectedBill(null)} bill={selectedBill} />
        </div>
    );
}
