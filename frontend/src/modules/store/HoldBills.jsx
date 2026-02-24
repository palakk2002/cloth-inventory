import React from 'react';
import { PauseCircle, Play, Trash2, Clock, ShoppingBag } from 'lucide-react';

export default function HoldBills({ holdBills, onResume, onDelete }) {
    if (holdBills.length === 0) return null;

    return (
        <div className="bg-card border border-amber-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border-b border-amber-200">
                <PauseCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Held Bills ({holdBills.length})
                </h3>
            </div>
            <div className="divide-y divide-border max-h-48 overflow-y-auto">
                {holdBills.map((bill, index) => (
                    <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    {bill.items.length} {bill.items.length === 1 ? 'item' : 'items'} · ₹{bill.items.reduce((t, i) => t + i.price * i.quantity, 0).toLocaleString()}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {bill.time}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => onResume(index)}
                                className="p-2 rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-all"
                                title="Resume this bill"
                            >
                                <Play className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => onDelete(index)}
                                className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                title="Discard this bill"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
