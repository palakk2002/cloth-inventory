import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { CheckCircle, Check, Clock, X } from 'lucide-react';
import Modal from '../components/Modal';

export default function Finishing() {
    const { state, moveProductionStage } = useAdmin();
    const batches = state.productionBatches.filter(b => b.stage === 'FINISHING');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        brand: '',
        salePrice: '',
        color: ''
    });

    const handleOpenModal = (batch) => {
        setSelectedBatch(batch);
        setFormData({
            name: batch.fabricId?.fabricType || '',
            category: state.categories[0]?.name || '',
            brand: 'Urban Style',
            salePrice: '',
            color: batch.fabricId?.color || ''
        });
        setIsModalOpen(true);
    };

    const handleComplete = (e) => {
        e.preventDefault();
        const metadata = {
            ...formData,
            salePrice: parseFloat(formData.salePrice),
        };
        moveProductionStage(selectedBatch._id, 'READY', metadata);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Finishing Stage</h1>
                <p className="text-muted-foreground">Final quality check and finishing touches</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map(batch => (
                    <div key={batch._id} className="card p-6 border-l-4 border-purple-500 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded shadow-sm">
                                    <Clock className="w-3 h-3" /> {new Date(batch.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black tracking-widest text-primary uppercase">{batch.batchNumber}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{batch.fabricId?.fabricType || 'Finishing Stage'}</h3>
                            <p className="text-sm text-muted-foreground mb-4">Quantity: <span className="font-bold text-foreground">{batch.totalPieces} pcs</span></p>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="p-2 bg-muted/50 rounded-lg text-center">
                                    <p className="text-[8px] uppercase font-bold text-muted-foreground">Meter Used</p>
                                    <p className="text-xs font-bold">{batch.meterUsed}m</p>
                                </div>
                                <div className="p-2 bg-muted/50 rounded-lg text-center">
                                    <p className="text-[8px] uppercase font-bold text-muted-foreground">Color</p>
                                    <p className="text-xs font-bold">{batch.fabricId?.color || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleOpenModal(batch)}
                            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-100"
                        >
                            Move to Ready (Generate Product) <Check className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {batches.length === 0 && (
                    <div className="col-span-full py-20 card flex flex-col items-center justify-center border-dashed">
                        <CheckCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                        <p className="text-muted-foreground font-medium">No batches in finishing stage.</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Complete Production & Create Product"
            >
                <form onSubmit={handleComplete} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Product Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="e.g. Cotton Shirt"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Category *</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                            >
                                <option value="">Select Category</option>
                                {state.categories.map(cat => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Brand *</label>
                            <input
                                type="text"
                                required
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Urban Style"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Sale Price (₹) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.salePrice}
                                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="999"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Color</label>
                            <input
                                type="text"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Red"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                        * Moving to READY will generate unique Barcodes and SKUs for this batch and add it to Factory Inventory.
                    </p>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            Finalize & Create Barcodes
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
