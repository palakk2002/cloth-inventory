import React from 'react';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function CartSection({ cartItems, onRemoveItem, onUpdateQuantity }) {
    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Cart is empty</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Scan a product code to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-muted/50 border-b border-border">
                    <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Size</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Qty</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Price</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Total</th>
                        <th className="px-4 py-3 w-12"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {cartItems.map((item, index) => (
                        <tr key={`${item.code}-${index}`} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                                <p className="text-sm font-semibold">{item.name}</p>
                                <p className="text-[10px] font-mono text-muted-foreground">{item.code}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{item.size}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{item.color}</td>
                            <td className="px-4 py-3 text-center">
                                <div className="inline-flex items-center border border-border rounded-md overflow-hidden">
                                    <button
                                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                                        className="px-2 py-1 text-xs hover:bg-muted transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="px-2.5 py-1 text-xs font-bold border-x border-border min-w-[32px] text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                                        className="px-2 py-1 text-xs hover:bg-muted transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-right">₹{item.price.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm font-bold text-right text-primary">₹{(item.price * item.quantity).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">
                                <button
                                    onClick={() => onRemoveItem(index)}
                                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
