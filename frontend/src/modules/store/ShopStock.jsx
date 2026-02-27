import React from 'react';
import { useAdmin } from '../admin/context/AdminContext';
import { Package, AlertTriangle, TrendingDown, ArrowDownToLine, ShoppingBag } from 'lucide-react';

export default function ShopStock() {
    const { state } = useAdmin();
    const CURRENT_SHOP_ID = state.user?.shopId || state.user?.storeId;
    const DEFAULT_LOW_THRESHOLD = 5;

    // Filter by storeId (backend uses storeId)
    const shopItems = (state.shopStock || []).filter(s =>
        (s.storeId === CURRENT_SHOP_ID || s.storeId?._id === CURRENT_SHOP_ID)
    );

    // Calculate total received per product from dispatches
    const getReceivedQty = (productId) => {
        return state.dispatches
            .filter(d => (d.shopId === CURRENT_SHOP_ID || d.storeId === CURRENT_SHOP_ID) &&
                (d.productId === productId || d.productId?._id === productId))
            .reduce((a, d) => a + (d.quantityReceived || 0), 0);
    };

    // Enrich shop items with received/sold data
    const enrichedItems = shopItems.map(item => ({
        ...item,
        id: item._id,
        productName: item.productId?.name || 'Unknown Product',
        currentStock: item.quantityAvailable,
        totalSold: item.quantitySold,
        sellingPrice: item.productId?.salePrice || 0,
        totalReceived: getReceivedQty(item.productId?._id || item.productId),
        threshold: item.minStockLevel || DEFAULT_LOW_THRESHOLD,
    }));

    const totalStock = enrichedItems.reduce((a, s) => a + s.currentStock, 0);
    const lowStockItems = enrichedItems.filter(s => s.currentStock > 0 && s.currentStock <= s.threshold);
    const outOfStockItems = enrichedItems.filter(s => s.currentStock === 0);

    const getStockBadge = (stock, threshold) => {
        if (stock === 0) return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">Out of Stock</span>;
        if (stock <= threshold) return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">Low Stock</span>;
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">In Stock</span>;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {state.loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-primary font-bold animate-pulse">Loading Inventory...</p>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shop Stock</h1>
                    <p className="text-muted-foreground">Current inventory and stock movements for this shop</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Items</p>
                        <p className="text-2xl font-bold text-foreground">{totalStock}</p>
                    </div>
                </div>

                <div className="card p-5 flex items-center gap-4 border-l-4 border-l-yellow-500">
                    <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Low Stock</p>
                        <p className="text-2xl font-bold text-foreground">{lowStockItems.length}</p>
                    </div>
                </div>

                <div className="card p-5 flex items-center gap-4 border-l-4 border-l-red-500">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Out of Stock</p>
                        <p className="text-2xl font-bold text-foreground">{outOfStockItems.length}</p>
                    </div>
                </div>

                <div className="card p-5 flex items-center gap-4 bg-muted/30">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <ArrowDownToLine className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Received</p>
                        <p className="text-2xl font-bold text-foreground">
                            {enrichedItems.reduce((a, s) => a + s.totalReceived, 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stock Table */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                    <h2 className="text-lg font-bold">Product Inventory</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Selling Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Received</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sold</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Current Stock</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {enrichedItems.map((item) => {
                                const masterProduct = state.productMaster?.find(p => p.name === item.productName);
                                return (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold">{item.productName}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono font-bold bg-muted px-2 py-1 rounded border border-border">
                                                {masterProduct?.sku || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">₹{item.sellingPrice.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-blue-700">
                                                <ArrowDownToLine className="w-3.5 h-3.5" />
                                                {item.totalReceived} units
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-orange-600">
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                {item.totalSold} units
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-sm font-bold ${item.currentStock <= item.threshold ? 'text-red-600' : 'text-foreground'}`}>
                                                    {item.currentStock} units
                                                </span>
                                                {item.currentStock <= item.threshold && item.currentStock > 0 && (
                                                    <span className="text-[10px] text-red-500 font-medium">Below threshold ({item.threshold})</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStockBadge(item.currentStock, item.threshold)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {enrichedItems.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        No stock available. Receive products from factory first! 📦
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
