import React from 'react';
import ProductBarcode from './ProductBarcode';

/**
 * ProductTagPreview Component
 * Logic: Renders a visual representation of a physical product tag.
 * Reusable across Add Product page, Modal View, and QR Preview page.
 */
export default function ProductTagPreview({ productData }) {
    if (!productData) return null;

    const {
        name, category, sku, size, color, mrp, discountPercent, brand, finalPrice
    } = productData;

    // Calculate final price if not provided (for live preview during add)
    const displayFinalPrice = finalPrice || (parseFloat(mrp) - (parseFloat(mrp) * (parseFloat(discountPercent) || 0) / 100)) || 0;

    return (
        <div className="flex flex-col items-center animate-in fade-in duration-500">
            {/* Physical Tag UI */}
            <div className="relative w-64 bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100 font-inter">

                {/* Barcode Section */}
                <div className="pt-6 pb-2 flex justify-center px-4 overflow-visible">
                    <ProductBarcode productData={productData} />
                </div>

                {/* Divider */}
                <div className="px-6">
                    <div className="border-t border-dashed border-slate-200 w-full mb-3"></div>
                </div>

                {/* Product Details Section */}
                <div className="px-6 py-1 pb-4 space-y-1">
                    <DetailRow label="Article" value={name || '---'} />
                    <DetailRow label="Group" value={category || '---'} />
                    <DetailRow label="Type" value={category ? "Apparel" : "---"} />
                    <DetailRow label="Design" value={sku || 'DRAFT'} mono />
                    <DetailRow label="Size" value={size || '---'} />

                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider py-0.5">
                        <span className="text-slate-400">Colour</span>
                        <div className="flex items-center gap-1.5">
                            {color && (
                                <div
                                    className="w-2.5 h-2.5 rounded-full border border-slate-200"
                                    style={{ backgroundColor: color.toLowerCase() }}
                                ></div>
                            )}
                            <span className="text-slate-800">{color || '---'}</span>
                        </div>
                    </div>

                    <DetailRow label="Brand" value={brand || '---'} />
                    <DetailRow label="Category" value={category || '---'} />

                    <div className="border-t border-dashed border-slate-200 w-full pt-2 mt-2"></div>

                    {/* Pricing Section */}
                    <div className="flex flex-col items-center pt-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase">MRP</span>
                            <span className="text-xl font-black text-slate-900 leading-none">
                                ₹{parseFloat(mrp || 0).toLocaleString()}
                            </span>
                        </div>

                        {(parseFloat(discountPercent) > 0) && (
                            <div className="mt-1 flex items-center gap-2">
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    ₹{displayFinalPrice.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold text-green-600 uppercase">
                                    -{discountPercent}% OFF
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Manufacturing Details Section */}
                    <div className="pt-3 border-t border-dashed border-slate-200 mt-3 text-[7px] leading-tight text-slate-500 font-medium">
                        <div className="mb-2">
                            <p className="font-bold text-slate-600 uppercase mb-0.5">Mfg. & Marketed By:</p>
                            <p>Rebel Mass Export Pvt. Ltd</p>
                            <p>Plot No 418, Sector-53, Phase3</p>
                            <p>Kundli, Sonipat (Haryana)</p>
                        </div>
                        <div>
                            <p className="font-bold text-slate-600 uppercase mb-0.5">Customer Care:</p>
                            <p>Email: info.dapolo@gmail.com</p>
                        </div>
                    </div>
                </div>

                {/* Brand Footer */}
                <div className="bg-slate-50 py-2 text-center border-t border-slate-100">
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">
                        Cloth Inventory
                    </p>
                </div>
            </div>
        </div>
    );
}

/** Helper Component for Detail Rows */
function DetailRow({ label, value, mono = false }) {
    return (
        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
            <span className="text-slate-400">{label}</span>
            <span className={`${mono ? 'font-mono tracking-tighter' : ''} text-slate-800 text-right truncate pl-4`}>
                {value}
            </span>
        </div>
    );
}
