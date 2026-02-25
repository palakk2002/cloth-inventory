import React, { useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import ProductTagPreview from './ProductTagPreview';

/**
 * ProductPreviewModal Component
 * Logic: Displays the ProductTagPreview component within a modal.
 * Triggered from the "Eye" icon in the Product Master table.
 */
export default function ProductPreviewModal({ isOpen, onClose, product }) {
    // Prevent scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-sm bg-slate-50 rounded-2xl shadow-2xl my-8 animate-in zoom-in-95 duration-300 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#1E3A56] text-white p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Tag className="w-5 h-5 text-blue-300" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Product Tag Preview</h2>
                            <p className="text-xs text-white/50">{product.sku}</p>
                        </div>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 pb-10 flex justify-center bg-slate-50/50">
                    <ProductTagPreview productData={product} />
                </div>
            </div>
        </div>
    );
}
