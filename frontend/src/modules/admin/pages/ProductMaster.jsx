import React, { useState, useMemo } from 'react';
import { useAdmin, generateSKU } from '../context/AdminContext';
import {
    Plus, Search, Filter, Trash2, Edit2,
    Barcode, Tag, Package, Box, IndianRupee,
    X, CheckCircle, AlertCircle, Eye
} from 'lucide-react';
import ProductTagPreview from '../components/product/ProductTagPreview';
import ProductPreviewModal from '../components/product/ProductPreviewModal';

export default function ProductMaster() {
    const { state, dispatch } = useAdmin();
    const { productMaster, skuCounter, categories } = state;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        size: '',
        color: '',
        mrp: '',
        discountPercent: '',
        stock: ''
    });
    const [previewProduct, setPreviewProduct] = useState(null);

    const [successMsg, setSuccessMsg] = useState('');

    // Categories names for dropdown
    const categoryOptions = categories.map(c => c.name);

    // Filtered products
    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return productMaster;
        const term = searchTerm.toLowerCase();
        return productMaster.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.sku.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        );
    }, [productMaster, searchTerm]);

    // Handle form input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Calculate final price
    const calculateFinalPrice = () => {
        const mrpValue = parseFloat(formData.mrp) || 0;
        const discValue = parseFloat(formData.discountPercent) || 0;
        return mrpValue - (mrpValue * discValue / 100);
    };

    const finalPrice = calculateFinalPrice();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            // Update existing product
            const existingProduct = productMaster.find(p => p.id === editingId);
            const updatedProduct = {
                ...existingProduct,
                name: formData.name,
                brand: formData.brand,
                category: formData.category,
                size: formData.size,
                color: formData.color,
                mrp: parseFloat(formData.mrp),
                discountPercent: parseFloat(formData.discountPercent) || 0,
                finalPrice: finalPrice,
                stock: parseInt(formData.stock) || 0,
            };

            dispatch({ type: 'UPDATE_MASTER_PRODUCT', payload: updatedProduct });
            setSuccessMsg('Product updated successfully!');
        } else {
            // Generate SKU for new product
            const sku = generateSKU(formData.category, formData.brand, formData.size, skuCounter);

            const newProduct = {
                id: Date.now(),
                sku,
                name: formData.name,
                brand: formData.brand,
                category: formData.category,
                size: formData.size,
                color: formData.color,
                mrp: parseFloat(formData.mrp),
                discountPercent: parseFloat(formData.discountPercent) || 0,
                finalPrice: finalPrice,
                stock: parseInt(formData.stock) || 0,
                barcodeSimulation: sku
            };

            dispatch({ type: 'ADD_MASTER_PRODUCT', payload: newProduct });
            setSuccessMsg('Product added successfully with SKU: ' + sku);
        }

        // Reset and close
        setFormData({
            name: '', brand: '', category: '',
            size: '', color: '', mrp: '',
            discountPercent: '', stock: ''
        });
        setEditingId(null);
        setIsModalOpen(false);
        setTimeout(() => setSuccessMsg(''), 5000);
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            brand: product.brand,
            category: product.category,
            size: product.size,
            color: product.color,
            mrp: product.mrp,
            discountPercent: product.discountPercent,
            stock: product.stock
        });
        setEditingId(product.id);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            dispatch({ type: 'DELETE_MASTER_PRODUCT', payload: id });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Product Master</h1>
                    <p className="text-muted-foreground">Manage centralized product inventory with auto-SKU generation</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            name: '', brand: '', category: '',
                            size: '', color: '', mrp: '',
                            discountPercent: '', stock: ''
                        });
                        setIsModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" /> Add New Product
                </button>
            </div>

            {successMsg && (
                <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl animate-in zoom-in-95 duration-300">
                    <CheckCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{successMsg}</p>
                </div>
            )}

            {/* Filters and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 card p-2 flex items-center px-4">
                    <Search className="w-4 h-4 text-muted-foreground mr-3" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by SKU, Name, Brand or Category..."
                        className="w-full bg-transparent border-none outline-none text-sm py-2"
                    />
                </div>
                <div className="card p-3 flex items-center justify-between px-5">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Total Master</span>
                    </div>
                    <span className="text-lg font-bold">{productMaster.length}</span>
                </div>
            </div>

            {/* Product Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU / Barcode</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category & Brand</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Size/Color</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProducts.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-mono font-bold bg-muted px-2 py-1 rounded border border-border tracking-tighter">
                                                {p.sku}
                                            </span>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Barcode className="w-3 h-3" />
                                                <span>SCAN READABLE</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-foreground">{p.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">ID: {p.id.toString().slice(-4)}</span>
                                            {p.stock <= 20 && (
                                                <span className="flex items-center gap-0.5 text-[10px] bg-red-100 text-red-700 px-1.5 rounded-full font-bold">
                                                    LOW STOCK
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-primary">{p.category}</span>
                                            <span className="text-xs text-muted-foreground">{p.brand}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium bg-muted/50 px-2 py-0.5 rounded border border-border">{p.size}</span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2.5 h-2.5 rounded-full border border-border" style={{ backgroundColor: p.color.toLowerCase() }}></div>
                                                <span className="text-xs text-muted-foreground">{p.color}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-foreground">₹{p.finalPrice.toLocaleString()}</span>
                                            <div className="flex items-center gap-1 text-[10px]">
                                                <span className="text-muted-foreground line-through">₹{p.mrp.toLocaleString()}</span>
                                                <span className="text-green-600 font-bold">-{p.discountPercent}%</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setPreviewProduct(p)}
                                                className="p-1.5 text-muted-foreground hover:text-blue-500 transition-colors"
                                                title="View Product Tag"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(p)}
                                                className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                        No master products found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 text-left">
                    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-x-hidden overflow-y-visible max-h-[90vh] animate-in zoom-in-95 duration-300">
                        <div className="bg-[#1E3A56] text-white p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {editingId ? <Edit2 className="w-5 h-5 text-blue-400" /> : <Box className="w-5 h-5 text-blue-400" />}
                                <h2 className="text-xl font-bold">{editingId ? 'Edit Master Product' : 'Add Master Product'}</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 min-w-0">
                                    {/* Left Col: Form */}
                                    <div className="lg:col-span-3 min-w-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Form Fields Column 1 */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Product Name *</label>
                                                    <div className="relative">
                                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <input
                                                            required
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            placeholder="e.g. Slim Fit Denim"
                                                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Brand *</label>
                                                        <input
                                                            required
                                                            name="brand"
                                                            value={formData.brand}
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            placeholder="e.g. UrbanWear"
                                                            className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Category *</label>
                                                        <select
                                                            required
                                                            name="category"
                                                            value={formData.category}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
                                                        >
                                                            <option value="">Select</option>
                                                            {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Size *</label>
                                                        <input
                                                            required
                                                            name="size"
                                                            value={formData.size}
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            placeholder="e.g. M, 32, XL"
                                                            className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Color *</label>
                                                        <input
                                                            required
                                                            name="color"
                                                            value={formData.color}
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            placeholder="e.g. Blue, Black"
                                                            className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Form Fields Column 2 */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">MRP *</label>
                                                    <div className="relative">
                                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <input
                                                            required
                                                            name="mrp"
                                                            value={formData.mrp}
                                                            onChange={handleInputChange}
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Discount (%)</label>
                                                    <input
                                                        name="discountPercent"
                                                        value={formData.discountPercent}
                                                        onChange={handleInputChange}
                                                        type="number"
                                                        placeholder="0"
                                                        className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Opening Stock (Optional)</label>
                                                    <input
                                                        name="stock"
                                                        value={formData.stock}
                                                        onChange={handleInputChange}
                                                        type="number"
                                                        placeholder="0"
                                                        className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                    />
                                                </div>

                                                {/* Final Price Preview */}
                                                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-muted-foreground uppercase">Estimated Final Price</span>
                                                        <span className="text-lg font-bold text-primary">₹{finalPrice.toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">
                                                        * Final price is calculated as MRP - Discount.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Col: Live Preview */}
                                    <div className="lg:col-span-2 flex flex-col items-center min-w-0">
                                        <div className="sticky top-0 w-full max-w-full flex flex-col items-center overflow-visible pr-2">
                                            <div className="mb-6 w-full">
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                    Live Tag Preview
                                                </h3>
                                                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex justify-center w-full max-w-full overflow-visible">
                                                    <ProductTagPreview productData={{
                                                        ...formData,
                                                        sku: editingId ? productMaster.find(p => p.id === editingId)?.sku : generateSKU(formData.category, formData.brand, formData.size, skuCounter)
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        {editingId ? 'Update Product' : 'Create Product'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Preview Modal */}
            <ProductPreviewModal
                isOpen={!!previewProduct}
                onClose={() => setPreviewProduct(null)}
                product={previewProduct}
            />
        </div>
    );
}

