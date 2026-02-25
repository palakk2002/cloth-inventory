import React from 'react';
import Barcode from 'react-barcode';

/**
 * ProductBarcode Component
 * Logic: Encodes product data into a JSON string and generates a 1D Barcode.
 */
export default function ProductBarcode({ productData, width = 1.0, height = 65 }) {
    if (!productData) return null;

    // Prepare data for the barcode as per requested JSON structure
    const barcodeData = {
        productName: productData.name || '',
        brand: productData.brand || '',
        category: productData.category || '',
        size: productData.size || '',
        color: productData.color || '',
        mrp: productData.mrp || 0,
        discount: productData.discountPercent || 0,
        finalPrice: productData.finalPrice || (parseFloat(productData.mrp) - (parseFloat(productData.mrp) * (parseFloat(productData.discountPercent) || 0) / 100)) || 0,
        designCode: productData.sku || ''
    };

    // Encode as JSON string
    const barcodeValue = JSON.stringify(barcodeData);

    return (
        <div className="inline-block max-w-full overflow-hidden text-center">
            <div className="flex justify-center">
                <Barcode
                    value={barcodeValue}
                    width={0.4} // Reduced width to fit JSON string into the tag width
                    height={65} // Increased height to match image
                    fontSize={10}
                    margin={0}
                    background="transparent"
                    lineColor="#000000"
                    displayValue={false} // Clean look like the image
                />
            </div>
            <div className="mt-1">
                <p className="text-[9px] font-mono font-bold text-slate-900 tracking-[0.2em]">
                    {productData.sku || '---'}
                </p>
            </div>
        </div>
    );
}
