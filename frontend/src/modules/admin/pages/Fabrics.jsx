import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Search, Scissors } from 'lucide-react';

export default function Fabrics() {
    const { state, dispatch } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFabric, setEditingFabric] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        totalMeter: '',
        pricePerMeter: '',
    });

    const handleOpenModal = (fabric = null) => {
        if (fabric) {
            setEditingFabric(fabric);
            setFormData({
                name: fabric.name,
                totalMeter: fabric.totalMeter,
                pricePerMeter: fabric.pricePerMeter,
            });
        } else {
            setEditingFabric(null);
            setFormData({ name: '', totalMeter: '', pricePerMeter: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            totalMeter: parseFloat(formData.totalMeter),
            pricePerMeter: parseFloat(formData.pricePerMeter),
        };
        if (editingFabric) {
            dispatch({ type: 'UPDATE_FABRIC', payload: { ...editingFabric, ...payload } });
        } else {
            dispatch({ type: 'ADD_FABRIC', payload });
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this fabric?')) {
            dispatch({ type: 'DELETE_FABRIC', payload: id });
        }
    };

    const filteredFabrics = state.fabrics.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCost = parseFloat(formData.totalMeter || 0) * parseFloat(formData.pricePerMeter || 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Fabrics</h1>
                    <p className="text-muted-foreground">Manage your fabric inventory and track usage</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2 w-fit"
                >
                    <Plus className="w-4 h-4" /> Add Fabric
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Scissors className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Fabrics</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{state.fabrics.length}</h3>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Scissors className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Meter Available</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">
                            {state.fabrics.reduce((acc, f) => acc + (f.totalMeter - f.usedMeter), 0).toLocaleString()} m
                        </h3>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                        <Scissors className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">
                            ₹{state.fabrics.reduce((acc, f) => acc + (f.totalMeter * f.pricePerMeter), 0).toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Fabric Table */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search fabrics..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fabric Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Meter</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Used Meter</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Remaining</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price/Meter</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Cost</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredFabrics.map((fabric) => {
                                const remaining = fabric.totalMeter - fabric.usedMeter;
                                return (
                                    <tr key={fabric.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold">{fabric.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{fabric.totalMeter} m</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{fabric.usedMeter} m</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-bold ${remaining <= 50 ? 'text-red-600' : 'text-green-600'}`}>
                                                {remaining} m
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">₹{fabric.pricePerMeter}</td>
                                        <td className="px-6 py-4 text-sm font-bold">₹{(fabric.totalMeter * fabric.pricePerMeter).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(fabric)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fabric.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredFabrics.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        No fabrics found. Add your first fabric! 🧵
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Fabric Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingFabric ? 'Edit Fabric' : 'Add Fabric'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Fabric Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Cotton White"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Total Meter</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.totalMeter}
                                onChange={(e) => setFormData({ ...formData, totalMeter: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Price Per Meter (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.pricePerMeter}
                                onChange={(e) => setFormData({ ...formData, pricePerMeter: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="150"
                            />
                        </div>
                    </div>

                    {/* Auto-calculated Total Cost */}
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Estimated Total Cost</p>
                        <p className="text-xl font-bold text-primary">₹{totalCost.toLocaleString()}</p>
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
                            {editingFabric ? 'Update Fabric' : 'Save Fabric'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
