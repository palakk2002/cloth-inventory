import React from 'react';
import { FileDown, X, Receipt } from 'lucide-react';
import jsPDF from 'jspdf';

export default function InvoicePreview({ isOpen, onClose, invoice }) {
    if (!isOpen || !invoice) return null;

    const exportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("INVOICE", 105, 20, { align: "center" });

        doc.setFontSize(12);
        doc.text(`Invoice ID: ${invoice.id}`, 20, 40);
        doc.text(`Date: ${invoice.date}`, 20, 50);
        doc.text(`Shop: ${invoice.shopName}`, 20, 60);

        doc.line(20, 70, 190, 70);

        doc.text("Product Details", 20, 80);
        doc.text(`Product Name: ${invoice.productName}`, 20, 90);
        doc.text(`Fabric Type: ${invoice.fabricType || 'N/A'}`, 20, 100);
        doc.text(`Quantity: ${invoice.quantity} pcs`, 20, 110);
        doc.text(`Price per unit: Rs. ${invoice.pricePerUnit}`, 20, 120);

        doc.line(20, 130, 190, 130);

        doc.setFontSize(14);
        doc.text(`Total Amount: Rs. ${invoice.total}`, 190, 140, { align: "right" });

        doc.save(`Invoice_${invoice.id}.pdf`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-[#1E3A56] text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-bold">Dispatch Invoice</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-start border-b border-dashed border-border pb-6">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Invoice For</p>
                            <h3 className="text-xl font-black text-slate-900">{invoice.shopName}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Date</p>
                            <p className="text-sm font-bold">{invoice.date}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">Product</span>
                            <span className="font-bold">{invoice.productName}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-slate-50">
                            <span className="text-muted-foreground">Fabric Type</span>
                            <span className="font-bold">{invoice.fabricType || 'Standard'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-slate-50">
                            <span className="text-muted-foreground">Quantity</span>
                            <span className="font-bold">{invoice.quantity} pcs</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-t border-slate-100 bg-slate-50/50 px-4 rounded-xl mt-4">
                            <span className="text-lg font-bold text-slate-900">Total Amount</span>
                            <span className="text-2xl font-black text-primary">₹{invoice.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-border flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 font-bold text-muted-foreground hover:bg-white rounded-xl transition-colors">Close</button>
                    <button
                        onClick={exportPDF}
                        className="btn-primary flex items-center gap-2"
                    >
                        <FileDown className="w-4 h-4" /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
