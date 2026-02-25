import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * ProductQRCode Component
 * Logic: Encodes product data into a JSON string and generates a QR code.
 * The QR code URL includes the product data as a query parameter.
 */
export default function ProductQRCode({ productData, size = 160 }) {
    if (!productData) return null;

    // Prepare data for the QR code
    // We include a URL that will open the preview page
    const baseUrl = window.location.origin;
    const encodedData = encodeURIComponent(JSON.stringify(productData));
    const qrValue = `${baseUrl}/admin/product-preview?data=${encodedData}`;

    return (
        <div className="bg-white p-3 rounded-xl border border-border shadow-sm inline-block">
            <QRCodeSVG
                value={qrValue}
                size={size}
                level="M"
                includeMargin={false}
                imageSettings={{
                    src: "/favicon.ico", // Optional: center icon
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                }}
            />
            <div className="mt-2 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Scan to Preview</p>
            </div>
        </div>
    );
}
