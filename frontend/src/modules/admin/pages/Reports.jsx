import React from 'react';
import { useAdmin } from '../context/AdminContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
    TrendingUp,
    DollarSign,
    AlertCircle,
    Download,
    Calendar
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

export default function Reports() {
    const { state } = useAdmin();

    // Inventory value calculation
    const totalValue = state.products.reduce((acc, p) => {
        const productTotal = p.variants.reduce((pAcc, v) => pAcc + (v.price * v.stock), 0);
        return acc + productTotal;
    }, 0);

    // Low stock items for report
    const lowStockReport = state.products.flatMap(p =>
        p.variants.filter(v => v.stock <= p.lowStockAlert).map(v => ({
            ...v,
            productName: p.name,
            category: p.category
        }))
    );

    // Mock Stock Movement Data (would normally come from state.stockHistory)
    const movementData = [
        { name: 'Mon', stockIn: 45, stockOut: 32 },
        { name: 'Tue', stockIn: 52, stockOut: 40 },
        { name: 'Wed', stockIn: 38, stockOut: 55 },
        { name: 'Thu', stockIn: 65, stockOut: 42 },
        { name: 'Fri', stockIn: 48, stockOut: 38 },
        { name: 'Sat', stockIn: 30, stockOut: 25 },
        { name: 'Sun', stockIn: 20, stockOut: 15 },
    ];

    // ──── Fabric Usage Report Data ────
    const fabricUsageData = state.fabrics.map(f => ({
        ...f,
        remaining: f.totalMeter - f.usedMeter,
        usagePercent: f.totalMeter > 0 ? ((f.usedMeter / f.totalMeter) * 100).toFixed(1) : 0,
    }));

    // ──── Production Report Data ────
    const productionReportData = state.fabricProducts.map(fp => {
        const fabric = state.fabrics.find(f => f.id === fp.fabricId);
        const totalProduced = state.productionLog
            .filter(l => l.fabricProductId === fp.id)
            .reduce((acc, l) => acc + l.quantity, 0);
        const totalMeterUsed = state.productionLog
            .filter(l => l.fabricProductId === fp.id)
            .reduce((acc, l) => acc + l.meterUsed, 0);
        return {
            productName: fp.name,
            fabricName: fabric?.name || '—',
            meterPerPiece: fp.meterPerPiece,
            totalProduced,
            totalMeterUsed,
            currentStock: fp.stock,
        };
    });

    // ──── Shop-wise Sales Report ────
    const shopSalesData = state.shops.map(shop => {
        const shopSales = state.sales.filter(s => s.shopId === shop.id);
        const totalQty = shopSales.reduce((acc, s) => acc + s.quantity, 0);
        const totalAmount = shopSales.reduce((acc, s) => acc + s.totalAmount, 0);
        return {
            shopName: shop.name,
            owner: shop.owner,
            totalOrders: shopSales.length,
            totalQty,
            totalAmount,
        };
    });

    // ──── Product-wise Sales Report ────
    const productSalesData = state.fabricProducts.map(fp => {
        const productSales = state.sales.filter(s => s.fabricProductId === fp.id);
        const totalQty = productSales.reduce((acc, s) => acc + s.quantity, 0);
        const totalAmount = productSales.reduce((acc, s) => acc + s.totalAmount, 0);
        return {
            productName: fp.name,
            sellingPrice: fp.sellingPrice,
            totalOrders: productSales.length,
            totalQty,
            totalAmount,
            currentStock: fp.stock,
        };
    });

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory Reports</h1>
                    <p className="text-muted-foreground">Deep dive into your stock performance and valuation</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-all">
                        <Calendar className="w-4 h-4" /> This Month
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-md">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Inventory Valuation"
                    value={`₹${totalValue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="+5.2%"
                    colorClass="bg-green-100 text-green-700"
                />
                <StatCard
                    label="Stock Movement"
                    value="420 Units"
                    icon={TrendingUp}
                    trend="+18%"
                    colorClass="bg-blue-100 text-blue-700"
                />
                <StatCard
                    label="Pending Reorders"
                    value={lowStockReport.length}
                    icon={AlertCircle}
                    colorClass="bg-orange-100 text-orange-700"
                />
            </div>

            <div className="card p-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold">Stock Movement Trends</h2>
                    <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-primary" /> Stock In
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-blue-400" /> Stock Out
                        </div>
                    </div>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={movementData}>
                            <defs>
                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1E3A56" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#1E3A56" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="stockIn" stroke="#1E3A56" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                            <Area type="monotone" dataKey="stockOut" stroke="#60A5FA" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Comprehensive Low Stock Report */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-bold">Comprehensive Low Stock Report</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product / Variant</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock Left</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Est. Reorder Cost</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {lowStockReport.map((item) => (
                                <tr key={item.sku} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{item.productName}</span>
                                            <span className="text-xs text-muted-foreground">{item.size} / {item.color}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs px-2 py-1 bg-slate-100 rounded-md font-medium text-slate-700">{item.category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">₹{item.price}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-600">{item.stock}</td>
                                    <td className="px-6 py-4 text-sm font-bold">₹{(item.price * 20).toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">(for 20 units)</span></td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={item.stock === 0 ? "Out of Stock" : "Low Stock"} />
                                    </td>
                                </tr>
                            ))}
                            {lowStockReport.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        No items require attention. High inventory health! 🚀
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ──── FABRIC USAGE REPORT ──── */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-bold">Fabric Usage Report</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fabric Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Meter</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Used Meter</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Remaining</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usage %</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {fabricUsageData.map((f) => (
                                <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold">{f.name}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{f.totalMeter} m</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{f.usedMeter} m</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-bold ${f.remaining <= 50 ? 'text-red-600' : 'text-green-600'}`}>
                                            {f.remaining} m
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full"
                                                    style={{ width: `${Math.min(f.usagePercent, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground">{f.usagePercent}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold">₹{(f.remaining * f.pricePerMeter).toLocaleString()}</td>
                                </tr>
                            ))}
                            {fabricUsageData.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground font-medium">No fabric data available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ──── PRODUCTION REPORT ──── */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-bold">Product Production Report</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fabric</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meter / Piece</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Produced</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meter Used</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {productionReportData.map((item, i) => (
                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold">{item.productName}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm px-2 py-1 bg-primary/5 text-primary rounded-md font-medium">{item.fabricName}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.meterPerPiece} m</td>
                                    <td className="px-6 py-4 text-sm font-bold">{item.totalProduced} pcs</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.totalMeterUsed} m</td>
                                    <td className="px-6 py-4 text-sm font-bold">{item.currentStock} pcs</td>
                                </tr>
                            ))}
                            {productionReportData.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground font-medium">No production data available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ──── SHOP-WISE SALES REPORT ──── */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-bold">Shop-wise Sales Report</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty Sold</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {shopSalesData.map((item, i) => (
                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold">{item.shopName}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.owner}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{item.totalOrders}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{item.totalQty} pcs</td>
                                    <td className="px-6 py-4 text-sm font-bold">₹{item.totalAmount.toLocaleString()}</td>
                                </tr>
                            ))}
                            {shopSalesData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-medium">No shop sales data available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ──── PRODUCT-WISE SALES REPORT ──── */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-bold">Product-wise Sales Report</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty Sold</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {productSalesData.map((item, i) => (
                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold">{item.productName}</td>
                                    <td className="px-6 py-4 text-sm font-medium">₹{item.sellingPrice}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{item.totalOrders}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{item.totalQty} pcs</td>
                                    <td className="px-6 py-4 text-sm font-bold">₹{item.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-bold ${item.currentStock <= 5 ? 'text-red-600' : 'text-slate-900'}`}>
                                            {item.currentStock} pcs
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {productSalesData.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground font-medium">No product sales data available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
