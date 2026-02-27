import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Factory, AlertCircle, CheckCircle2, Ruler, ClipboardList } from 'lucide-react';

export default function Production() {
    const { state, addProductionBatch } = useAdmin();

    const [fabricId, setFabricId] = useState('');
    const [meterUsed, setMeterUsed] = useState('');
    const [breakdown, setBreakdown] = useState({ S: 0, M: 0, L: 0, XL: 0, FREE: 0 });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const selectedFabric = state.fabrics.find(f => f.id === fabricId || f._id === fabricId);
    const availableMeter = selectedFabric ? selectedFabric.meterAvailable : 0;

    const totalPieces = Object.values(breakdown).reduce((a, b) => a + parseInt(b || 0), 0);
    const meterPerPiece = totalPieces > 0 ? (parseFloat(meterUsed || 0) / totalPieces).toFixed(2) : 0;

    const handleBreakdownChange = (size, value) => {
        setBreakdown(prev => ({ ...prev, [size]: parseInt(value) || 0 }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!fabricId || parseFloat(meterUsed) <= 0 || totalPieces <= 0) {
            setError('Please select a fabric and enter valid quantities/meters.');
            return;
        }

        if (parseFloat(meterUsed) > availableMeter) {
            setError(`Insufficient fabric! Available: ${availableMeter} m, Requested: ${meterUsed} m`);
            return;
        }

        const sizeBreakdown = Object.entries(breakdown)
            .filter(([_, qty]) => qty > 0)
            .map(([size, quantity]) => ({ size, quantity }));

        const res = await addProductionBatch({
            fabricId,
            meterUsed: parseFloat(meterUsed),
            sizeBreakdown
        });

        if (res.success) {
            setSuccess(`Success! Production batch started with ${totalPieces} pieces.`);
            setFabricId('');
            setMeterUsed('');
            setBreakdown({ S: 0, M: 0, L: 0, XL: 0, FREE: 0 });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Production Master</h1>
                <p className="text-muted-foreground">Start new production batches from fabric inventory</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Factory className="w-5 h-5 text-primary" /> New Production Batch
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Select Fabric *</label>
                                    <select
                                        value={fabricId}
                                        onChange={(e) => { setFabricId(e.target.value); setError(''); setSuccess(''); }}
                                        required
                                        className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                    >
                                        <option value="">Choose a fabric...</option>
                                        {state.fabrics.filter(f => f.meterAvailable > 0).map(f => (
                                            <option key={f.id} value={f.id}>
                                                {f.name} - {f.color} ({f.meterAvailable}m available)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Total Meter to Use *</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={meterUsed}
                                            onChange={(e) => setMeterUsed(e.target.value)}
                                            required
                                            className="w-full pl-4 pr-10 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="e.g. 100"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">MTR</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" /> Size Breakdown (Quantity)
                                </label>
                                <div className="grid grid-cols-5 gap-3">
                                    {['S', 'M', 'L', 'XL', 'FREE'].map(size => (
                                        <div key={size} className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground text-center block">{size}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={breakdown[size]}
                                                onChange={(e) => handleBreakdownChange(size, e.target.value)}
                                                className="w-full px-2 py-1.5 border border-border rounded-lg text-center text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary Box */}
                            <div className="p-4 bg-muted/30 rounded-xl border border-border grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Pieces</p>
                                    <p className="text-lg font-black text-primary">{totalPieces}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Meter / Piece</p>
                                    <p className="text-lg font-black text-primary">{meterPerPiece}m</p>
                                </div>
                                <div className="hidden md:block text-center border-l border-border pl-4">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Fabric Remaining</p>
                                    <p className="text-sm font-bold mt-1">{(availableMeter - parseFloat(meterUsed || 0)).toFixed(2)}m</p>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
                                </div>
                            )}

                            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                                <Factory className="w-5 h-5" /> Initiate Production Batch
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Card */}
                <div className="space-y-6">
                    <div className="card p-5 bg-primary text-white">
                        <h3 className="text-lg font-bold mb-2">Production Guideline</h3>
                        <p className="text-sm opacity-90 leading-relaxed">
                            Start a batch by selecting a fabric. The fabric stock will be reduced immediately.
                            Batches move through stages:
                        </p>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold bg-white/10 p-2 rounded">
                                <span className="w-4 h-4 rounded-full bg-white text-primary flex items-center justify-center text-[10px]">1</span>
                                Material Received
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold bg-white/10 p-2 rounded">
                                <span className="w-4 h-4 rounded-full bg-white text-primary flex items-center justify-center text-[10px]">2</span>
                                Cutting Stage
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold bg-white/10 p-2 rounded">
                                <span className="w-4 h-4 rounded-full bg-white text-primary flex items-center justify-center text-[10px]">3</span>
                                Finishing Stage
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold bg-white/10 p-2 rounded">
                                <span className="w-4 h-4 rounded-full bg-white text-primary flex items-center justify-center text-[10px]">4</span>
                                Ready (Generates Barcodes)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Production Log */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-bold">Production Log</h2>
                    <span className="text-xs font-bold text-muted-foreground uppercase">Recent Batches</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Batch No.</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fabric Used</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty (Breakdown)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meter Used</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {state.productionBatches.map((batch) => {
                                const fabric = state.fabrics.find(f => f.id === batch.fabricId || f._id === batch.fabricId?._id || f._id === batch.fabricId);
                                return (
                                    <tr key={batch._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold font-mono text-primary">{batch.batchNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{fabric?.name || '—'}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase">{fabric?.color || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{batch.totalPieces} pcs</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {batch.sizeBreakdown?.map(s => `${s.size}:${s.quantity}`).join(', ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-muted-foreground">{batch.meterUsed} m</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${batch.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {batch.stage.replace('_', ' ')}
                                            </span>
                                        </td>

                                    </tr>
                                );
                            })}
                            {state.productionBatches.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        No production batches found. Start your first batch! 🏭
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
