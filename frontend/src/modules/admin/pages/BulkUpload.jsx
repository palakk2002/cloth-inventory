import React, { useState, useMemo } from 'react';
import { useAdmin, generateSKU } from '../context/AdminContext';
import {
    Upload, FileText, CheckCircle, AlertCircle,
    Table as TableIcon, Trash2, X, Download
} from 'lucide-react';

export default function BulkUpload() {
    const { state, dispatch } = useAdmin();
    const { skuCounter } = state;

    const [csvData, setCsvData] = useState('');
    const [parsedData, setParsedData] = useState([]);
    const [isParsed, setIsParsed] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleParse = (e) => {
        e.preventDefault();
        if (!csvData.trim()) {
            setErrorMsg('Please paste some CSV data first.');
            return;
        }

        try {
            const rows = csvData.trim().split('\n');
            const header = rows[0].split(',').map(h => h.trim().toLowerCase());

            // Required columns: name, brand, category, size, color, mrp, discount
            const required = ['name', 'brand', 'category', 'size', 'color', 'mrp', 'discount'];
            const missing = required.filter(r => !header.includes(r));

            if (missing.length > 0) {
                setErrorMsg(`Missing columns: ${missing.join(', ')}`);
                return;
            }

            const nameIdx = header.indexOf('name');
            const brandIdx = header.indexOf('brand');
            const catIdx = header.indexOf('category');
            const sizeIdx = header.indexOf('size');
            const colorIdx = header.indexOf('color');
            const mrpIdx = header.indexOf('mrp');
            const distIdx = header.indexOf('discount');

            let tempCounter = skuCounter;
            const newProducts = rows.slice(1).map((row, idx) => {
                const cols = row.split(',').map(c => c.trim());
                if (cols.length < header.length) return null;

                const name = cols[nameIdx];
                const brand = cols[brandIdx];
                const cat = cols[catIdx];
                const size = cols[sizeIdx];
                const color = cols[colorIdx];
                const mrp = parseFloat(cols[mrpIdx]);
                const discount = parseFloat(cols[distIdx]) || 0;
                const finalPrice = mrp - (mrp * discount / 100);

                const sku = generateSKU(cat, brand, size, tempCounter++);

                return {
                    id: Date.now() + idx,
                    sku,
                    name,
                    brand,
                    category: cat,
                    size,
                    color,
                    mrp,
                    discountPercent: discount,
                    finalPrice,
                    stock: 0,
                    barcodeSimulation: sku
                };
            }).filter(p => p !== null);

            setParsedData(newProducts);
            setIsParsed(true);
            setErrorMsg('');
        } catch (err) {
            setErrorMsg('Error parsing CSV. Please check formatting.');
            console.error(err);
        }
    };

    const handleImport = () => {
        if (parsedData.length === 0) return;

        dispatch({ type: 'BULK_ADD_MASTER_PRODUCTS', payload: parsedData });

        setSuccessMsg(`Successfully imported ${parsedData.length} products!`);
        setParsedData([]);
        setIsParsed(false);
        setCsvData('');

        setTimeout(() => setSuccessMsg(''), 5000);
    };

    const clearParsed = () => {
        setParsedData([]);
        setIsParsed(false);
    };

    const downloadSample = () => {
        const content = "Name,Brand,Category,Size,Color,MRP,Discount\nSummer T-Shirt,UrbanStyle,Shirts,M,Blue,999,10\nCotton Kurta,FabIndia,Ethnic,L,White,1500,5";
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_products.csv';
        a.click();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Bulk Product Import</h1>
                <p className="text-muted-foreground">Import multiple products at once via CSV data</p>
            </div>

            {successMsg && (
                <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl">
                    <CheckCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{successMsg}</p>
                </div>
            )}

            {errorMsg && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{errorMsg}</p>
                </div>
            )}

            {!isParsed ? (
                <div className="card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Paste CSV Content</h2>
                        </div>
                        <button
                            onClick={downloadSample}
                            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        >
                            <Download className="w-4 h-4" /> Download Sample Template
                        </button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Instructions: Paste plain CSV data including headers. Required columns: <span className="font-mono text-primary font-bold">name, brand, category, size, color, mrp, discount</span>.
                    </p>

                    <textarea
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                        placeholder="Name,Brand,Category,Size,Color,MRP,Discount&#10;Product A,Brand X,Shirts,M,Blue,1200,10"
                        className="w-full h-64 p-4 font-mono text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-muted/20"
                    />

                    <div className="flex justify-end">
                        <button
                            onClick={handleParse}
                            className="btn-primary flex items-center gap-2"
                        >
                            <TableIcon className="w-4 h-4" /> Preview & Generate SKUs
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                                <TableIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold">Import Preview</h2>
                                <p className="text-xs text-muted-foreground">{parsedData.length} records ready to import</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={clearParsed}
                                className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                                Back to Edit
                            </button>
                            <button
                                onClick={handleImport}
                                className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                            >
                                Confirm Import
                            </button>
                        </div>
                    </div>

                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Generated SKU</th>
                                        <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Product Name</th>
                                        <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Cat/Brand</th>
                                        <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase text-right">MRP</th>
                                        <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase text-right">Final Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {parsedData.map((p, i) => (
                                        <tr key={i} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-3 font-mono font-bold text-primary">{p.sku}</td>
                                            <td className="px-6 py-3 font-medium">{p.name}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-muted-foreground">{p.category}</span>
                                                    <span className="text-xs text-muted-foreground">{p.brand}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right text-muted-foreground line-through">₹{p.mrp}</td>
                                            <td className="px-6 py-3 text-right font-bold text-foreground">₹{p.finalPrice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
