import React, { useURI, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ProductTagPreview from '../components/product/ProductTagPreview';
import { ShieldCheck, AlertCircle } from 'lucide-react';

/**
 * ProductPreviewPage Component
 * Standalone page for QR code scans.
 * Logic: Decodes product data from the 'data' query parameter and renders the tag preview.
 */
export default function ProductPreviewPage() {
    const location = useLocation();

    const productData = useMemo(() => {
        try {
            const searchParams = new URLSearchParams(location.search);
            const encodedData = searchParams.get('data');
            if (!encodedData) return null;
            return JSON.parse(decodeURIComponent(encodedData));
        } catch (error) {
            console.error('Failed to decode product data from URL:', error);
            return null;
        }
    }, [location.search]);

    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 font-inter">
            {/* Background blobs for aesthetic */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1E3A56]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                {/* Simple Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-[#1E3A56] rounded-xl flex items-center justify-center mb-3 shadow-lg">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#1E3A56]/80">Cloth Inventory</h2>
                    <p className="text-xs text-slate-400 mt-1">Product Authentication & Details</p>
                </div>

                {productData ? (
                    <ProductTagPreview productData={productData} />
                ) : (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-50 flex flex-col items-center text-center max-w-xs">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Invalid Scan</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            We couldn't retrieve the product details from this scan. Please try scanning the original QR code again.
                        </p>
                    </div>
                )}

                <footer className="mt-12 text-center">
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                        &copy; 2026 Cloth Inventory Limited
                    </p>
                </footer>
            </div>
        </div>
    );
}
