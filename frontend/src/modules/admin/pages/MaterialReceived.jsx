import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Package, ArrowRight, Clock } from 'lucide-react';

export default function MaterialReceived() {
    const { state, dispatch } = useAdmin();
    const batches = state.productionBatches.filter(b => b.status === 'material');

    const handleMove = (batchId) => {
        dispatch({
            type: 'MOVE_PRODUCTION_BATCH',
            payload: { batchId, nextStatus: 'cutting' }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Material Received</h1>
                <p className="text-muted-foreground">Raw materials ready for production</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map(batch => (
                    <div key={batch.id} className="card p-6 border-l-4 border-yellow-500 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                                    <Clock className="w-3 h-3" /> {batch.date}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{batch.productName}</h3>
                            <p className="text-sm text-muted-foreground mb-4">Quantity: <span className="font-bold text-foreground">{batch.quantity} pcs</span></p>
                        </div>

                        <button
                            onClick={() => handleMove(batch.id)}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-yellow-100"
                        >
                            Move to Cutting <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {batches.length === 0 && (
                    <div className="col-span-full py-20 card flex flex-col items-center justify-center border-dashed">
                        <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                        <p className="text-muted-foreground font-medium">No material batches waiting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
