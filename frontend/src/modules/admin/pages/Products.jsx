import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Plus, Edit2, Trash2, Search, Layers, X } from 'lucide-react';

export default function Products() {
    const { state, dispatch } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        description: '',
        lowStockAlert: 10,
        variants: [{ id: Date.now(), size: '', color: '', sku: '', price: 0, stock: 0 }]
    });

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ ...product });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                brand: '',
                category: '',
                description: '',
                lowStockAlert: 10,
                variants: [{ id: Date.now(), size: '', color: '', sku: '', price: 0, stock: 0 }]
            });
        }
        setIsModalOpen(true);
    };

    const addVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { id: Date.now(), size: '', color: '', sku: '', price: 0, stock: 0 }]
        });
    };

    const removeVariant = (id) => {
        if (formData.variants.length === 1) return;
        setFormData({
            ...formData,
            variants: formData.variants.filter(v => v.id !== id)
        });
    };

    const handleVariantChange = (id, field, value) => {
        setFormData({
            ...formData,
            variants: formData.variants.map(v => v.id === id ? { ...v, [field]: value } : v)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingProduct) {
            dispatch({ type: 'UPDATE_PRODUCT', payload: formData });
        } else {
            dispatch({ type: 'ADD_PRODUCT', payload: formData });
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            dispatch({ type: 'DELETE_PRODUCT', payload: id });
        }
    };

    const filteredProducts = state.products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">Manage your clothing inventory and variants</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2 w-fit"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            <div className="card overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search products or brands..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Variants</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Stock</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProducts.map((p) => {
                                const totalStock = p.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
                                const isLowStock = p.variants.some(v => v.stock <= p.lowStockAlert);

                                return (
                                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{p.name}</span>
                                                <span className="text-xs text-muted-foreground">{p.brand}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm px-2 py-1 bg-primary/5 text-primary rounded-md font-medium">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Layers className="w-3 h-3" />
                                                {p.variants.length} Variants
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>{totalStock}</span>
                                                <StatusBadge status={totalStock === 0 ? "Out of Stock" : (isLowStock ? "Low Stock" : "In Stock")} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(p)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Edit Product' : 'Add Product'}
            >
                <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Product Name</label>
                            <input
                                type="text" required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Polo Tshirt"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Brand</label>
                            <input
                                type="text" required
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Royal Wear"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Category</label>
                            <select
                                value={formData.category}
                                required
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Select Category</option>
                                {state.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Low Stock Alert at</label>
                            <input
                                type="number" required
                                value={formData.lowStockAlert}
                                onChange={(e) => setFormData({ ...formData, lowStockAlert: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Description</label>
                        <textarea
                            rows="2"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-primary">Variants (Size, Color, Price, Stock)</label>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Variant
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.variants.map((v, index) => (
                                <div key={v.id} className="p-4 border border-border bg-muted/20 rounded-xl relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(v.id)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-border text-red-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Size</label>
                                            <input
                                                type="text" required placeholder="M"
                                                value={v.size}
                                                onChange={(e) => handleVariantChange(v.id, 'size', e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-white outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Color</label>
                                            <input
                                                type="text" required placeholder="Blue"
                                                value={v.color}
                                                onChange={(e) => handleVariantChange(v.id, 'color', e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-white outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">SKU</label>
                                            <input
                                                type="text" required placeholder="POLO-M-BLU"
                                                value={v.sku}
                                                onChange={(e) => handleVariantChange(v.id, 'sku', e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-white outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Price</label>
                                            <input
                                                type="number" required
                                                value={v.price}
                                                onChange={(e) => handleVariantChange(v.id, 'price', parseFloat(e.target.value))}
                                                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-white outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Stock</label>
                                            <input
                                                type="number" required
                                                value={v.stock}
                                                onChange={(e) => handleVariantChange(v.id, 'stock', parseInt(e.target.value))}
                                                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-white outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                        >
                            {editingProduct ? 'Update Product' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
