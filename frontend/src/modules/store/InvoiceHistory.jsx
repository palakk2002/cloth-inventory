import React, { useState } from 'react';
import { useAdmin } from '../admin/context/AdminContext';
import { Receipt, Search, FileDown, Eye } from 'lucide-react';
import InvoicePreview from '../admin/components/InvoicePreview';

export default function InvoiceHistory() {
    const { state } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    // Filter invoices for this store (assuming ID 1 for now)
    const storeInvoices = state.invoices.filter(inv =>
        inv.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setIsInvoiceOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoice History</h1>
                    <p className="text-muted-foreground">View and download all dispatch invoices for this store</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-border">
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Invoice ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Qty</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {storeInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                                <Receipt className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="font-mono font-bold text-slate-900">{inv.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{inv.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{inv.productName}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase">{inv.fabricType}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-700">{inv.quantity}</td>
                                    <td className="px-6 py-4 text-right font-black text-primary">₹{inv.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openInvoice(inv)}
                                            className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                            title="View Invoice"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {storeInvoices.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Receipt className="w-12 h-12 mb-4 opacity-10" />
                                            <p className="font-medium text-slate-400">No invoices found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InvoicePreview
                isOpen={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
                invoice={selectedInvoice}
            />
        </div>
    );
}
