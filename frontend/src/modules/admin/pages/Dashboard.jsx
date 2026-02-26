import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
    Package,
    Tag,
    Users,
    AlertTriangle,
    ChevronRight,
    Scissors,
    Store,
    ShoppingCart,
    IndianRupee,
    UserCheck,
    Send,
    Truck,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function Dashboard() {
    const { state } = useAdmin();
    const navigate = useNavigate();

    // Calculate Stats
    const totalProducts = state.products.length;
    const totalCategories = state.categories.length;
    const totalStaff = state.staff.length;

    const lowStockItems = state.products.flatMap(p =>
        p.variants.filter(v => v.stock <= p.lowStockAlert).map(v => ({
            ...v,
            productName: p.name
        }))
    );

    const lowStockCount = lowStockItems.length;

    // Existing Module Stats
    const totalFabrics = state.fabrics.length;
    const totalFabricProductsStock = state.fabricProducts.reduce((acc, p) => acc + p.stock, 0);
    const totalShops = state.shops.length;

    // Dispatch Stats
    const totalDispatched = state.dispatches.reduce((a, d) => a + d.quantitySent, 0);
    const totalDelivered = state.dispatches.filter(d => d.status === 'Delivered').length;
    const pendingDeliveries = state.dispatches.filter(d => d.status === 'Pending').length;

    // Revenue from store bills
    const totalRevenue = state.storeBills.reduce((a, b) => a + b.totalAmount, 0);

    // Chart Data
    const stockOverviewData = state.products.map(p => ({
        name: p.name,
        stock: p.variants.reduce((acc, v) => acc + v.stock, 0)
    }));

    const categoryData = state.categories.map(cat => ({
        name: cat.name,
        value: state.products.filter(p => p.category === cat.name).length
    }));

    const COLORS = ['#1E3A56', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

    // Shop-wise stock
    const shopStockData = state.shops.map(shop => {
        const stockItems = state.shopStock.filter(s => s.shopId === shop.id);
        const totalStock = stockItems.reduce((a, s) => a + s.currentStock, 0);
        const shopBills = state.storeBills.filter(b => b.shopId === shop.id);
        const shopRevenue = shopBills.reduce((a, b) => a + b.totalAmount, 0);
        const shopSalesCount = shopBills.length;
        return { ...shop, totalStock, shopRevenue, shopSalesCount };
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {state.loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-primary font-bold animate-pulse">Fetching Dashboard Stats...</p>
                    </div>
                </div>
            )}

            {state.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="font-bold">Data Fetch Error</p>
                        <p className="text-sm opacity-90">{state.error}</p>
                    </div>
                </div>
            )}

            {/* Dashboard Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                <StatCard
                    label="Total Products"
                    value={totalProducts}
                    icon={Package}
                    trend="+12%"
                    path="/admin/products"
                />
                <StatCard
                    label="Total Categories"
                    value={totalCategories}
                    icon={Tag}
                    trend="+2%"
                    path="/admin/categories"
                    colorClass="bg-blue-100 text-blue-700"
                />
                <StatCard
                    label="Total Staff"
                    value={totalStaff}
                    icon={Users}
                    path="/admin/staff"
                    colorClass="bg-indigo-100 text-indigo-700"
                />
                <StatCard
                    label="Low Stock Items"
                    value={lowStockCount}
                    icon={AlertTriangle}
                    path="/admin/stock"
                    colorClass="bg-orange-100 text-orange-700"
                />
                <StatCard
                    label="Total Fabrics"
                    value={totalFabrics}
                    icon={Scissors}
                    path="/admin/fabrics"
                    colorClass="bg-purple-100 text-purple-700"
                />
                <StatCard
                    label="Factory Stock"
                    value={totalFabricProductsStock}
                    icon={ShoppingCart}
                    path="/admin/production"
                    colorClass="bg-cyan-100 text-cyan-700"
                />
                <StatCard
                    label="Total Shops"
                    value={totalShops}
                    icon={Store}
                    path="/admin/shops"
                    colorClass="bg-emerald-100 text-emerald-700"
                />
                <StatCard
                    label="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    icon={IndianRupee}
                    colorClass="bg-amber-100 text-amber-700"
                />
                <StatCard
                    label="Total Dispatched"
                    value={`${totalDispatched} pcs`}
                    icon={Send}
                    path="/admin/dispatch"
                    colorClass="bg-teal-100 text-teal-700"
                />
                <StatCard
                    label="Delivered"
                    value={totalDelivered}
                    icon={CheckCircle2}
                    path="/admin/dispatch"
                    colorClass="bg-green-100 text-green-700"
                />
                <StatCard
                    label="Pending Deliveries"
                    value={pendingDeliveries}
                    icon={Clock}
                    path="/admin/dispatch"
                    colorClass="bg-red-100 text-red-700"
                />
                <StatCard
                    label="Supplier Orders"
                    value={state.supplierOrders.length}
                    icon={Truck}
                    path="/admin/supplier-orders"
                    colorClass="bg-violet-100 text-violet-700"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stock Overview Chart */}
                <div className="lg:col-span-2 card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold">Stock Overview</h2>
                        <Link to="/admin/products" className="text-primary text-sm font-semibold hover:underline">View All</Link>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stockOverviewData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="stock" fill="#1E3A56" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold mb-8">Category Distribution</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {categoryData.map((data, index) => (
                            <div key={data.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-muted-foreground">{data.name}</span>
                                </div>
                                <span className="font-semibold">{data.value} Products</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Shop-wise Stock & Revenue */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-bold">Shop-wise Overview</h2>
                    <button
                        onClick={() => navigate('/admin/shops')}
                        className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        View Shops <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Stock</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bills Generated</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {shopStockData.map((shop) => (
                                <tr key={shop.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold">{shop.name}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{shop.totalStock} pcs</td>
                                    <td className="px-6 py-4 text-sm font-medium">{shop.shopSalesCount}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-600">₹{shop.shopRevenue.toLocaleString()}</td>
                                </tr>
                            ))}
                            {shopStockData.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No shops registered yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Low Stock Items Table */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-bold">Low Stock Items</h2>
                    <button
                        onClick={() => navigate('/admin/stock')}
                        className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        Manage Stock <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Variant</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock Left</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {lowStockItems.length > 0 ? lowStockItems.map((item) => (
                                <tr key={item.sku} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium">{item.productName}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.size} / {item.color}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{item.sku}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-600">{item.stock}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={item.stock === 0 ? "Out of Stock" : "Low Stock"} />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No low stock items. Everything is fine! ✨</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
