import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Scissors, ArrowRight, Clock } from 'lucide-react';

export default function Cutting() {
    const { state, moveProductionStage } = useAdmin();
    const batches = state.productionBatches.filter(b => b.stage === 'CUTTING');

    const handleMove = (batchId) => {
        moveProductionStage(batchId, 'FINISHING');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Cutting Stage</h1>
                <p className="text-muted-foreground">Managing products in the cutting process</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map(batch => (
                    <div key={batch._id} className="card p-6 border-l-4 border-blue-500 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Scissors className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded shadow-sm">
                                    <Clock className="w-3 h-3" /> {new Date(batch.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black tracking-widest text-primary uppercase">{batch.batchNumber}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{batch.fabricId?.fabricType || 'Cutting Stage'}</h3>
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
                            onClick={() => handleMove(batch._id)}
                            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100"
                        >
                            Move to Finishing <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {batches.length === 0 && (
                    <div className="col-span-full py-20 card flex flex-col items-center justify-center border-dashed">
                        <Scissors className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                        <p className="text-muted-foreground font-medium">No batches in cutting stage.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
