import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import { UserCheck, Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function Customers() {
    const { state, dispatch } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', contact: '', shopId: '', address: '' });

    const handleOpenModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({ name: customer.name, contact: customer.contact, shopId: customer.shopId, address: customer.address || '' });
        } else {
            setEditingCustomer(null);
            setFormData({ name: '', contact: '', shopId: '', address: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData, shopId: parseInt(formData.shopId) };
        if (editingCustomer) {
            dispatch({ type: 'UPDATE_CUSTOMER', payload: { ...payload, id: editingCustomer.id } });
        } else {
            dispatch({ type: 'ADD_CUSTOMER', payload });
        }
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            dispatch({ type: 'DELETE_CUSTOMER', payload: id });
        }
    };

    const getShopName = (shopId) => state.shops.find(s => s.id === shopId)?.name || '—';

    const getCustomerPurchaseTotal = (customerId) =>
        state.customerPurchases
            .filter(p => p.customerId === customerId)
            .reduce((acc, p) => acc + p.totalAmount, 0);

    const filteredCustomers = state.customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getShopName(c.shopId).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCustomers = state.customers.length;
    const totalCustomerSpend = state.customerPurchases.reduce((acc, p) => acc + p.totalAmount, 0);

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label="Total Customers" value={totalCustomers} icon={UserCheck} colorClass="bg-violet-100 text-violet-700" />
                <StatCard label="Total Customer Spend" value={`₹${totalCustomerSpend.toLocaleString()}`} icon={UserCheck} colorClass="bg-teal-100 text-teal-700" />
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">Manage your customer database</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 shadow-md">
                    <Plus className="w-4 h-4" /> Add Customer
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Purchase</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold">{customer.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm px-2 py-1 bg-primary/5 text-primary rounded-md font-medium">{getShopName(customer.shopId)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{customer.contact}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{customer.address || '—'}</td>
                                    <td className="px-6 py-4 text-sm font-bold">₹{getCustomerPurchaseTotal(customer.id).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleOpenModal(customer)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(customer.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground font-medium">No customers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCustomer ? 'Edit Customer' : 'Add Customer'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Enter customer name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact *</label>
                        <input
                            type="text"
                            required
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Enter contact number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Shop *</label>
                        <select
                            required
                            value={formData.shopId}
                            onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="">Select a shop</option>
                            {state.shops.map(shop => (
                                <option key={shop.id} value={shop.id}>{shop.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Address (Optional)</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Enter address"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg font-medium text-slate-700 hover:bg-muted transition-all">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 btn-primary shadow-md">
                            {editingCustomer ? 'Update' : 'Add Customer'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
