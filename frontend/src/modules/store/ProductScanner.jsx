import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAdmin } from '../admin/context/AdminContext';
import { Search, AlertTriangle, ShoppingBag, Plus, Minus, Barcode, CheckCircle2, Zap, Camera } from 'lucide-react';
import BarcodeCameraScanner from './BarcodeCameraScanner';

const CURRENT_SHOP_ID_PLACEHOLDER = 1;

// ── Reusable search utility ──
function searchProductBySku(skuOrCode, productMaster, shopStock, shopId) {
    const query = skuOrCode.trim().toUpperCase();
    if (!query) return null;

    // 1. Search Product Master by SKU or Barcode
    const masterHit = productMaster.find(p => p.sku.toUpperCase() === query || p.barcode.toUpperCase() === query);

    if (masterHit) {
        // Find if this product is in this shop's stock
        // Note: shopStock items from backend have productId and quantityAvailable
        const stockItem = shopStock.find(s => s.productId === masterHit._id);

        return {
            fabricProductId: masterHit._id,
            name: masterHit.name,
            price: masterHit.salePrice,
            code: masterHit.sku,
            barcode: masterHit.barcode,
            size: masterHit.size || '',
            color: masterHit.color || '',
            brand: masterHit.brand || '',
            stock: stockItem ? stockItem.quantityAvailable : 0,
            source: 'master',
        };
    }

    return null;
}

export default function ProductScanner({ onAddToCart }) {
    const { state } = useAdmin();
    const { productMaster, shopStock, user } = state;
    const shopId = user?.shopId || state.shops?.[0]?._id;

    // ── State ──
    const [searchTerm, setSearchTerm] = useState('');
    const [skuInput, setSkuInput] = useState('');
    const [foundProduct, setFoundProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [notFound, setNotFound] = useState(false);
    const [skuNotFound, setSkuNotFound] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [lastScanned, setLastScanned] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // ── Refs ──
    const skuInputRef = useRef(null);
    const successTimer = useRef(null);

    // Auto-focus SKU input on mount
    useEffect(() => {
        skuInputRef.current?.focus();
    }, []);

    // ── Show success toast ──
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

        const result = searchProductBySku(skuInput, productMaster, shopStock, shopId);

        if (result) {
            onAddToCart({ ...result, quantity: 1 });
            showSuccess(`Added: ${result.name}`, { code: result.code, name: result.name });
            setSkuInput('');
            setTimeout(() => skuInputRef.current?.focus(), 50);
        } else {
            setSkuNotFound(true);
            setSuccessMsg('');
            skuInputRef.current?.select();
        }
    };

    // ── Barcode JSON Handler (Camera Scan) ──
    const handleBarcodeScan = (data) => {
        if (!data) return;

        // Try to find the product in our master list first for accuracy
        const skuOrBarcode = data.barcode || data.designCode || data.sku;
        const result = searchProductBySku(skuOrBarcode, productMaster, shopStock, shopId);

        if (result) {
            onAddToCart({ ...result, quantity: 1 });
            showSuccess(`Scanned: ${result.name}`, { code: result.code, name: result.name });
        } else {
            // Fallback to data from scan if not in master (less reliable)
            const productFromScan = {
                fabricProductId: data._id || Date.now(),
                name: data.productName || data.name || 'Unknown Product',
                price: parseFloat(data.finalPrice || data.salePrice || data.mrp || 0),
                code: data.designCode || data.sku || '',
                size: data.size || '',
                color: data.color || '',
                brand: data.brand || '',
                stock: 999,
                source: 'scanner',
                quantity: 1
            };
            onAddToCart(productFromScan);
            showSuccess(`Scanned: ${productFromScan.name}`, { code: productFromScan.code, name: productFromScan.name });
        }
    };

    // ── Name Search Handler ──
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        const term = searchTerm.toLowerCase();
        // Search in master list for name match
        const masterHits = productMaster.filter(p => p.name.toLowerCase().includes(term));

        if (masterHits.length > 0) {
            // Pick first hit for now or show dropdown (simplifying to first hit for POS speed)
            const hit = masterHits[0];
            const stockItem = shopStock.find(s => s.productId === hit._id);

            setFoundProduct({
                fabricProductId: hit._id,
                productName: hit.name,
                sellingPrice: hit.salePrice,
                currentStock: stockItem ? stockItem.quantityAvailable : 0,
                code: hit.sku,
                size: hit.size,
                color: hit.color,
                brand: hit.brand
            });
            setNotFound(false);
            setQuantity(1);
        } else {
            setFoundProduct(null);
            setNotFound(true);
        }
    };

    // ── Add from name-search card ──
    const handleAddToCart = () => {
        if (!foundProduct || quantity < 1) return;
        // Allow adding even if 0 stock? Usually no for POS, but maybe for preorder. 
        // Let's stick to simple POS logic.
        if (foundProduct.currentStock < quantity) {
            setNotFound(true);
            return;
        }

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
    const quickSelectProduct = (product) => {
        const stockItem = shopStock.find(s => s.productId === product._id);
        setFoundProduct({
            fabricProductId: product._id,
            productName: product.name,
            sellingPrice: product.salePrice,
            currentStock: stockItem ? stockItem.quantityAvailable : 0,
            code: product.sku,
            size: product.size,
            color: product.color,
            brand: product.brand
        });
        setSearchTerm(product.name);
        setQuantity(1);
        setNotFound(false);
    };

    // Quick Select Items: Show first few items that are actually in stock
    const inStockMasterItems = productMaster
        .filter(p => shopStock.some(s => s.productId === p._id && s.quantityAvailable > 0))
        .slice(0, 6);

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
                    <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        className="px-4 py-2.5 border border-primary text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-2"
                        title="Open Camera Scanner"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {/* Camera Scanner Modal */}
            {isScannerOpen && (
                <BarcodeCameraScanner
                    onScan={handleBarcodeScan}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}

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
                {inStockMasterItems.map(item => (
                    <button
                        key={item._id}
                        onClick={() => quickSelectProduct(item)}
                        className="text-xs font-medium px-3 py-1.5 bg-muted/50 text-muted-foreground border border-border rounded-lg hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                    >
                        {item.name}
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
