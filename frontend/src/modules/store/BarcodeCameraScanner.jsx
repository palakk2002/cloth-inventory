import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

/**
 * BarcodeCameraScanner Component
 * Logic: Uses html5-qrcode to scan barcodes from the camera.
 * Decodes JSON data and passes it to the parent.
 */
export default function BarcodeCameraScanner({ onScan, onClose }) {
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.777778, // 16:9 for barcode scanning
                formatsToSupport: [
                    // Support both QR and common 1D barcodes for flexibility
                    "QR_CODE", "CODE_128", "CODE_39", "EAN_13", "EAN_8"
                ]
            },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                try {
                    // Try to parse JSON from the scanned text
                    const data = JSON.parse(decodedText);
                    onScan(data);
                    scanner.clear();
                    onClose();
                } catch (err) {
                    // If not JSON, it might just be the SKU string
                    console.log("Scanned text is not valid JSON, treating as SKU:", decodedText);
                    onScan({ designCode: decodedText });
                    scanner.clear();
                    onClose();
                }
            },
            (errorMessage) => {
                // Ignore parse errors (common during scanning)
            }
        );

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear scanner on unmount", error);
            });
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-4 bg-[#1E3A56] text-white flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-wider">Barcode Scanner</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-4">
                    <div id="reader" className="w-full"></div>
                    <p className="mt-4 text-xs text-muted-foreground text-center italic">
                        Position the barcode within the box above.
                    </p>
                </div>
            </div>
        </div>
    );
}
