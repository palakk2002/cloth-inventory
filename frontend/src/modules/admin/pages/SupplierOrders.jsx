import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import Modal from '../components/Modal';
import { Truck, Plus, AlertCircle, CheckCircle2, PackageCheck, Clock, Search } from 'lucide-react';

export default function SupplierOrders() {
    const { state, dispatch } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [receivingOrder, setReceivingOrder] = useState(null);
    const [receivedQty, setReceivedQty] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        supplierName: '', clothType: '', quantityOrdered: '',
        pricePerUnit: '', orderDate: '', expectedDelivery: '',
    });

    const totalAmount = (parseFloat(formData.quantityOrdered) || 0) * (parseFloat(formData.pricePerUnit) || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch({
            type: 'ADD_SUPPLIER_ORDER',
            payload: {
                ...formData,
                quantityOrdered: parseInt(formData.quantityOrdered),
                pricePerUnit: parseFloat(formData.pricePerUnit),
                totalAmount,
            }
        });
        setFormData({ supplierName: '', clothType: '', quantityOrdered: '', pricePerUnit: '', orderDate: '', expectedDelivery: '' });
        setIsModalOpen(false);
    };

    const openReceiveModal = (order) => {
        setReceivingOrder(order);
        setReceivedQty('');
        setError('');
        setSuccess('');
        setIsReceiveModalOpen(true);
    };

    const handleReceive = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const qty = parseInt(receivedQty);
        if (!qty || qty <= 0) { setError('Enter a valid quantity.'); return; }
        const remaining = receivingOrder.quantityOrdered - receivingOrder.quantityReceived;
        if (qty > remaining) { setError(`Cannot receive more than remaining (${remaining} meters).`); return; }

        dispatch({ type: 'RECEIVE_SUPPLIER_ORDER', payload: { orderId: receivingOrder.id, receivedQty: qty } });
        setSuccess(`Received ${qty} meters of ${receivingOrder.clothType}!`);
        setReceivingOrder({ ...receivingOrder, quantityReceived: receivingOrder.quantityReceived + qty });
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Pending': 'bg-yellow-100 text-yellow-700',
            'Partially Received': 'bg-blue-100 text-blue-700',
            'Fully Received': 'bg-green-100 text-green-700',
        };
        return (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    const filteredOrders = state.supplierOrders.filter(o =>
        o.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.clothType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Summary stats
    const totalOrders = state.supplierOrders.length;
    const pendingOrders = state.supplierOrders.filter(o => o.status === 'Pending').length;
    const totalSpent = state.supplierOrders.reduce((a, o) => a + o.totalAmount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Supplier Orders</h1>
                    <p className="text-muted-foreground">Order raw cloth from suppliers and track receiving</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 w-fit">
                    <Plus className="w-4 h-4" /> New Order
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{totalOrders}</h3>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{pendingOrders}</h3>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                        <PackageCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">₹{totalSpent.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text" placeholder="Search suppliers or cloth type..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cloth Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ordered</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Received</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Remaining</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold">{order.supplierName}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm px-2 py-1 bg-primary/5 text-primary rounded-md font-medium">{order.clothType}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">{order.quantityOrdered} m</td>
                                    <td className="px-6 py-4 text-sm font-medium text-green-600">{order.quantityReceived} m</td>
                                    <td className="px-6 py-4 text-sm font-medium text-orange-600">{order.quantityOrdered - order.quantityReceived} m</td>
                                    <td className="px-6 py-4 text-sm font-bold">₹{order.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                    <td className="px-6 py-4">
                                        {order.status !== 'Fully Received' && (
                                            <button
                                                onClick={() => openReceiveModal(order)}
                                                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                                            >
                                                <PackageCheck className="w-4 h-4" /> Receive
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        No supplier orders found. Create your first order! 📦
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Order Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Supplier Order">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Supplier Name</label>
                            <input type="text" required value={formData.supplierName}
                                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Textile India Pvt" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Cloth Type</label>
                            <select value={formData.clothType} required
                                onChange={(e) => setFormData({ ...formData, clothType: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20">
                                <option value="">Select cloth...</option>
                                {state.fabrics.map(f => (
                                    <option key={f.id} value={f.name}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Quantity (meters)</label>
                            <input type="number" required min="1" value={formData.quantityOrdered}
                                onChange={(e) => setFormData({ ...formData, quantityOrdered: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="200" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Price per Unit (₹)</label>
                            <input type="number" required min="1" value={formData.pricePerUnit}
                                onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="150" />
                        </div>
                    </div>
                    {totalAmount > 0 && (
                        <div className="p-4 bg-muted/30 rounded-xl border border-border">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Amount</p>
                            <p className="text-lg font-bold text-primary">₹{totalAmount.toLocaleString()}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Order Date</label>
                            <input type="date" required value={formData.orderDate}
                                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Expected Delivery</label>
                            <input type="date" required value={formData.expectedDelivery}
                                onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-all">Cancel</button>
                        <button type="submit" className="btn-primary flex-1">Place Order</button>
                    </div>
                </form>
            </Modal>

            {/* Receive Modal */}
            <Modal isOpen={isReceiveModalOpen} onClose={() => setIsReceiveModalOpen(false)} title="Verify Cloth Receiving">
                {receivingOrder && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Supplier</p>
                                <p className="text-sm font-bold">{receivingOrder.supplierName}</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Cloth Type</p>
                                <p className="text-sm font-bold">{receivingOrder.clothType}</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Ordered</p>
                                <p className="text-sm font-bold">{receivingOrder.quantityOrdered} m</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Already Received</p>
                                <p className="text-sm font-bold text-green-600">{receivingOrder.quantityReceived} m</p>
                            </div>
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 col-span-2">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Remaining</p>
                                <p className="text-lg font-bold text-primary">{receivingOrder.quantityOrdered - receivingOrder.quantityReceived} m</p>
                            </div>
                        </div>

                        <form onSubmit={handleReceive} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Quantity Received (meters)</label>
                                <input type="number" required min="1"
                                    max={receivingOrder.quantityOrdered - receivingOrder.quantityReceived}
                                    value={receivedQty}
                                    onChange={(e) => { setReceivedQty(e.target.value); setError(''); }}
                                    className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Enter received quantity" />
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

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsReceiveModalOpen(false)}
                                    className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-all">Close</button>
                                <button type="submit" className="btn-primary flex-1">Confirm Receive</button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>
        </div>
    );
}
