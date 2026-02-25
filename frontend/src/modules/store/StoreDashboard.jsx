import React, { useState } from 'react';
import { useAdmin } from '../admin/context/AdminContext';
import { ShoppingCart, IndianRupee, Package, TrendingUp, UserCircle, Phone } from 'lucide-react';
import ProductScanner from './ProductScanner';
import CartSection from './CartSection';
import BillingSummary from './BillingSummary';
import PaymentSection from './PaymentSection';
import BillModal from './BillModal';
import HoldBills from './HoldBills';

const CURRENT_SHOP_ID = 1;
const CURRENT_SHOP_NAME = 'Cloth Inventory';

export default function StoreDashboard() {
    const { state, dispatch } = useAdmin();

    const [cartItems, setCartItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discount, setDiscount] = useState(0);
    const [holdBills, setHoldBills] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [billData, setBillData] = useState(null);
    const [billCounter, setBillCounter] = useState(
        state.storeBills.filter(b => b.shopId === CURRENT_SHOP_ID).length + 1
    );
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // Today's summary from storeBills for this shop
    const today = new Date().toISOString().split('T')[0];
    const todayBills = state.storeBills.filter(b => b.shopId === CURRENT_SHOP_ID && b.date === today);
    const todaysSummary = {
        totalOrders: todayBills.length,
        totalRevenue: todayBills.reduce((a, b) => a + b.totalAmount, 0),
        totalItems: todayBills.reduce((a, b) => a + b.items.reduce((x, i) => x + i.quantity, 0), 0),
    };

    // ---- Core Logic ----

    const addToCart = (product) => {
        setCartItems((prev) => {
            const existing = prev.findIndex((item) => item.fabricProductId === product.fabricProductId);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = {
                    ...updated[existing],
                    quantity: updated[existing].quantity + product.quantity,
                };
                return updated;
            }
            return [...prev, product];
        });
    };

    const removeFromCart = (index) => {
        setCartItems((prev) => prev.filter((_, i) => i !== index));
    };

    const updateQuantity = (index, newQty) => {
        if (newQty < 1) {
            removeFromCart(index);
            return;
        }
        setCartItems((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], quantity: newQty };
            return updated;
        });
    };

    const calculateTotals = () => {
        const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const gst = subtotal * 0.05;
        const grandTotal = subtotal + gst - discount;
        return { subtotal, gst, grandTotal: Math.max(0, grandTotal) };
    };

    const generateBill = () => {
        if (cartItems.length === 0) return;
        const { subtotal, gst, grandTotal } = calculateTotals();
        const now = new Date();
        const billId = `BILL-${now.getFullYear()}-${String(billCounter).padStart(4, '0')}`;

        const billItems = cartItems.map(item => ({
            fabricProductId: item.fabricProductId,
            productName: item.name,
            quantity: item.quantity,
            pricePerUnit: item.price,
            total: item.price * item.quantity,
        }));

        const data = {
            billId,
            dateTime: now.toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true,
            }),
            customerName: customerName || 'Walk-in Customer',
            staffName: 'Rahul Sharma',
            items: billItems,
            subtotal,
            gst,
            discount,
            grandTotal,
            paymentMethod,
        };

        // Save to global context
        dispatch({
            type: 'ADD_STORE_BILL',
            payload: {
                billId,
                shopId: CURRENT_SHOP_ID,
                shopName: CURRENT_SHOP_NAME,
                customerName: customerName || 'Walk-in Customer',
                customerPhone: customerPhone || '',
                items: billItems,
                subtotal,
                gst,
                discount,
                totalAmount: grandTotal,
                date: now.toISOString().split('T')[0],
                time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
                paymentMethod,
                paymentStatus: 'Paid',
                transactionId: paymentMethod !== 'cash'
                    ? `${paymentMethod.toUpperCase()}-TXN-${Date.now().toString().slice(-7)}`
                    : null,
            }
        });

        setBillData(data);
        setShowModal(true);
        setBillCounter((c) => c + 1);

        setCartItems([]);
        setDiscount(0);
        setPaymentMethod('cash');
        setCustomerName('');
        setCustomerPhone('');
    };

    const holdCurrentBill = () => {
        if (cartItems.length === 0) return;
        const now = new Date();
        setHoldBills((prev) => [
            ...prev,
            {
                items: [...cartItems],
                discount,
                paymentMethod,
                customerName,
                time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            },
        ]);
        setCartItems([]);
        setDiscount(0);
        setCustomerName('');
    };

    const resumeHoldBill = (index) => {
        const bill = holdBills[index];
        setCartItems(bill.items);
        setDiscount(bill.discount);
        setPaymentMethod(bill.paymentMethod);
        setCustomerName(bill.customerName || '');
        setHoldBills((prev) => prev.filter((_, i) => i !== index));
    };

    const deleteHoldBill = (index) => {
        setHoldBills((prev) => prev.filter((_, i) => i !== index));
    };

    const { subtotal, gst, grandTotal } = calculateTotals();

    // Summary stat cards data
    const summaryCards = [
        { label: "Today's Orders", value: todaysSummary.totalOrders, icon: ShoppingCart, color: 'bg-blue-100 text-blue-700' },
        { label: "Today's Revenue", value: `₹${todaysSummary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: IndianRupee, color: 'bg-green-100 text-green-700' },
        { label: 'Items Sold', value: todaysSummary.totalItems, icon: Package, color: 'bg-purple-100 text-purple-700' },
    ];

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Today's Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {summaryCards.map((card) => (
                    <div key={card.label} className="bg-card border border-border rounded-xl shadow-sm p-4 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                        <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center shrink-0`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                            <h3 className="text-xl font-bold tracking-tight mt-0.5">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main POS Layout – 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* LEFT COLUMN – Product Scanner */}
                <div className="lg:col-span-3 space-y-5">
                    <div className="bg-card border border-border rounded-xl shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h2 className="text-base font-bold">Product Scanner</h2>
                        </div>
                        <ProductScanner onAddToCart={addToCart} />
                    </div>

                    {/* Hold Bills */}
                    <HoldBills holdBills={holdBills} onResume={resumeHoldBill} onDelete={deleteHoldBill} />
                </div>

                {/* RIGHT COLUMN – Cart & Billing */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Customer Name */}
                    <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <UserCircle className="w-4 h-4 text-primary" />
                            <label className="text-sm font-bold">Customer Name</label>
                        </div>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Walk-in Customer"
                        />
                        <div className="flex items-center gap-2 mt-3 mb-1">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <label className="text-xs font-medium text-muted-foreground">Phone (optional)</label>
                        </div>
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="98XXXXXXXX"
                        />
                    </div>

                    {/* Cart */}
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-primary" />
                                <h2 className="text-sm font-bold">Cart</h2>
                            </div>
                            {cartItems.length > 0 && (
                                <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                                    {cartItems.reduce((a, i) => a + i.quantity, 0)} items
                                </span>
                            )}
                        </div>
                        <CartSection
                            cartItems={cartItems}
                            onRemoveItem={removeFromCart}
                            onUpdateQuantity={updateQuantity}
                        />
                    </div>

                    {/* Billing Summary */}
                    <BillingSummary
                        subtotal={subtotal}
                        gst={gst}
                        discount={discount}
                        grandTotal={grandTotal}
                        onDiscountChange={setDiscount}
                    />

                    {/* Payment & Actions */}
                    <PaymentSection
                        paymentMethod={paymentMethod}
                        onPaymentChange={setPaymentMethod}
                        onGenerateBill={generateBill}
                        onHoldBill={holdCurrentBill}
                        cartItemsCount={cartItems.length}
                    />
                </div>
            </div>

            {/* Bill Modal */}
            <BillModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                billData={billData}
            />
        </div>
    );
}
