import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAdmin } from '../admin/context/AdminContext';
import { storeProducts } from './mockData';
import { Search, AlertTriangle, ShoppingBag, Plus, Minus, Barcode, CheckCircle2, Zap } from 'lucide-react';

const CURRENT_SHOP_ID = 1;

// ── Reusable search utility (future: swap for API call) ──
function searchProductBySku(skuOrCode, productMaster, shopStock, shopId) {
    const query = skuOrCode.trim().toUpperCase();
    if (!query) return null;

    // 1. Search Product Master by SKU
    const masterHit = productMaster.find(p => p.sku.toUpperCase() === query);
    if (masterHit) {
        const stockItem = shopStock.find(s => s.shopId === shopId && s.productName === masterHit.name);
        return {
            fabricProductId: stockItem ? stockItem.fabricProductId : masterHit.id,
            name: masterHit.name,
            price: masterHit.finalPrice,
            code: masterHit.sku,
            size: masterHit.size || '',
            color: masterHit.color || '',
            brand: masterHit.brand || '',
            stock: stockItem ? stockItem.currentStock : masterHit.stock,
            source: 'master',
        };
    }

    // 2. Search Store Products (mockData) by code
    const storeHit = storeProducts.find(p => p.code.toUpperCase() === query);
    if (storeHit) {
        return {
            fabricProductId: storeHit.id,
            name: storeHit.name,
            price: storeHit.price,
            code: storeHit.code,
            size: storeHit.size || '',
            color: storeHit.color || '',
            brand: '',
            stock: storeHit.stock,
            source: 'store',
        };
    }

    return null;
}

export default function ProductScanner({ onAddToCart }) {
    const { state } = useAdmin();
    const { productMaster, shopStock } = state;

    // ── State ──
    const [searchTerm, setSearchTerm] = useState('');
    const [skuInput, setSkuInput] = useState('');
    const [foundProduct, setFoundProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [notFound, setNotFound] = useState(false);
    const [skuNotFound, setSkuNotFound] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [lastScanned, setLastScanned] = useState(null);

    // ── Refs ──
    const skuInputRef = useRef(null);
    const successTimer = useRef(null);

    // Auto-focus SKU input on mount
    useEffect(() => {
        skuInputRef.current?.focus();
    }, []);

    // Get this shop's stock
    const shopItems = shopStock.filter(s => s.shopId === CURRENT_SHOP_ID);

    // ── Show success toast (auto-dismiss after 2.5s) ──
    const showSuccess = useCallback((msg, product) => {
        setSuccessMsg(msg);
        setLastScanned(product);
        setSkuNotFound(false);
        if (successTimer.current) clearTimeout(successTimer.current);
        successTimer.current = setTimeout(() => setSuccessMsg(''), 2500);
    }, []);

    // ── SKU / Barcode Scan Handler ──
    const handleSkuScan = (e) => {
        e.preventDefault();
        if (!skuInput.trim()) return;

        const result = searchProductBySku(skuInput, productMaster, shopStock, CURRENT_SHOP_ID);

        if (result) {
            onAddToCart({ ...result, quantity: 1 });
            showSuccess(`Added: ${result.name}`, { code: result.code, name: result.name });
            setSkuInput('');
            // Re-focus for next scan
            setTimeout(() => skuInputRef.current?.focus(), 50);
        } else {
            setSkuNotFound(true);
            setSuccessMsg('');
            // Keep focus so cashier can correct input
            skuInputRef.current?.select();
        }
    };

    // ── Name Search Handler ──
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        const found = shopItems.find(
            item => item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (found) {
            setFoundProduct(found);
            setNotFound(false);
            setQuantity(1);
        } else {
            // Also search storeProducts by name
            const storeHit = storeProducts.find(
                p => p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (storeHit) {
                setFoundProduct({
                    ...storeHit,
                    productName: storeHit.name,
                    sellingPrice: storeHit.price,
                    currentStock: storeHit.stock,
                    fabricProductId: storeHit.id,
                });
                setNotFound(false);
                setQuantity(1);
            } else {
                setFoundProduct(null);
                setNotFound(true);
            }
        }
    };

    // ── Add from name-search card ──
    const handleAddToCart = () => {
        if (!foundProduct || quantity < 1) return;
        if (quantity > foundProduct.currentStock) return;

        onAddToCart({
            fabricProductId: foundProduct.fabricProductId,
            name: foundProduct.productName,
            price: foundProduct.sellingPrice,
            quantity,
            code: foundProduct.code || '',
            size: foundProduct.size || '',
            color: foundProduct.color || '',
            stock: foundProduct.currentStock,
        });

        showSuccess(`Added: ${foundProduct.productName} × ${quantity}`, {
            code: foundProduct.code || 'N/A',
            name: foundProduct.productName,
        });
        setFoundProduct(null);
        setSearchTerm('');
        setQuantity(1);
    };

    // ── Quick-select from chips ──
    const quickSelectProduct = (item) => {
        setFoundProduct(item);
        setSearchTerm(item.productName);
        setQuantity(1);
        setNotFound(false);
    };

    return (
        <div className="space-y-4">
            {/* ── Search Inputs (side by side) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setNotFound(false); }}
                            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Search product name..."
                        />
                    </div>
                    <button type="submit" className="btn-primary">Search</button>
                </form>

                {/* SKU / Barcode Scan Input */}
                <form onSubmit={handleSkuScan} className="flex gap-2">
                    <div className="relative flex-1">
                        <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            ref={skuInputRef}
                            type="text"
                            value={skuInput}
                            onChange={(e) => { setSkuInput(e.target.value); setSkuNotFound(false); }}
                            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30"
                            placeholder="Scan or type SKU / Product Code..."
                            autoComplete="off"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2.5 bg-[#1E3A56] text-white text-sm font-bold rounded-lg hover:bg-[#2c537a] transition-colors">
                        Scan
                    </button>
                </form>
            </div>

            {/* ── Feedback Messages ── */}
            {successMsg && (
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium animate-in slide-in-from-top-2 duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {successMsg}
                </div>
            )}
            {notFound && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> Product not found in shop stock.
                </div>
            )}
            {skuNotFound && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> SKU / Product Code not recognized. Please check and try again.
                </div>
            )}

            {/* ── Last Scanned Indicator ── */}
            {lastScanned && !successMsg && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span>Last scanned: <span className="font-mono font-bold">{lastScanned.code}</span> → {lastScanned.name}</span>
                </div>
            )}

            {/* ── Quick-Select Product Chips ── */}
            <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase self-center mr-1">Quick Add:</span>
                {shopItems.slice(0, 6).map(item => (
                    <button
                        key={item.id}
                        onClick={() => quickSelectProduct(item)}
                        className="text-xs font-medium px-3 py-1.5 bg-muted/50 text-muted-foreground border border-border rounded-lg hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                    >
                        {item.productName}
                    </button>
                ))}
            </div>

            {/* ── Found Product Card (from name search) ── */}
            {foundProduct && (
                <div className="p-4 bg-muted/20 rounded-xl border border-border space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-base font-bold">{foundProduct.productName}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">₹{foundProduct.sellingPrice.toLocaleString()}</p>
                        </div>
                        <div>
                            {foundProduct.currentStock === 0 ? (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">OUT OF STOCK</span>
                            ) : foundProduct.currentStock <= 5 ? (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">LOW STOCK ({foundProduct.currentStock})</span>
                            ) : (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">In Stock ({foundProduct.currentStock})</span>
                            )}
                        </div>
                    </div>

                    {foundProduct.currentStock > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-3 py-2 hover:bg-muted transition-colors">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 text-sm font-bold border-x border-border min-w-[48px] text-center">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(foundProduct.currentStock, quantity + 1))}
                                    className="px-3 py-2 hover:bg-muted transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <button onClick={handleAddToCart} className="btn-primary flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" /> Add to Cart
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
