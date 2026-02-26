import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Search, Store, AlertCircle } from 'lucide-react';

export default function Shops() {
    const { state, dispatch, addStore, deleteStore: deleteStoreAction } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShop, setEditingShop] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        owner: '',
        contact: '',
        address: '',
    });

    const handleOpenModal = (shop = null) => {
        if (shop) {
            setEditingShop(shop);
            setFormData({ name: shop.name, owner: shop.owner || '', contact: shop.contact || '', address: shop.address || '' });
        } else {
            setEditingShop(null);
            setFormData({ name: '', owner: '', contact: '', address: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingShop) {
            alert('Update shop is currently restricted.');
        } else {
            const res = await addStore(formData);
            if (res.success) setIsModalOpen(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this shop?')) {
            await deleteStoreAction(id);
        }
    };

    const filteredShops = state.shops.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.owner?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Calculate total purchases per shop from storeBills data
    const getShopPurchaseTotal = (shopId) => {
        return state.storeBills
            .filter(b => b.shopId === shopId)
            .reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    };

    return (
        <div className="space-y-6">
            {state.loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-primary font-bold animate-pulse">Loading Stores...</p>
                    </div>
                </div>
            )}

            {state.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p>{state.error}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shops</h1>
                    <p className="text-muted-foreground">Manage your retail shop partners</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2 w-fit"
                >
                    <Plus className="w-4 h-4" /> Add Shop
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Shops</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{state.shops.length}</h3>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Sales Value</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">
                            ₹{state.storeBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0).toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Shops Table */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search shops or owners..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Purchase</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredShops.map((shop) => (
                                <tr key={shop._id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold">{shop.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{shop.owner}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{shop.contact}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-[200px] truncate">{shop.address}</td>
                                    <td className="px-6 py-4 text-sm font-bold">₹{getShopPurchaseTotal(shop._id).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(shop)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(shop._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredShops.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        No shops found. Add your first shop! 🏪
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Shop Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingShop ? 'Edit Shop' : 'Add Shop'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Shop Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Cloth Inventory"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Owner Name</label>
                            <input
                                type="text"
                                required
                                value={formData.owner}
                                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Rahul Sharma"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Contact Number</label>
                        <input
                            type="tel"
                            required
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="9876543210"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Address</label>
                        <textarea
                            rows="2"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="MG Road, Delhi"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            {editingShop ? 'Update Shop' : 'Save Shop'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
