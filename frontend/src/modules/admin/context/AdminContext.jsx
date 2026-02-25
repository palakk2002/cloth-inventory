import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { seedProductMaster } from '../../data/products';

const AdminContext = createContext();

const initialState = {
    categories: [
        { id: 1, name: 'Shirts', description: 'Full sleeve and half sleeve shirts', status: 'Active' },
        { id: 2, name: 'Jeans', description: 'Denim jeans for all sizes', status: 'Active' },
        { id: 3, name: 'Dresses', description: 'Summer and party dresses', status: 'Active' },
    ],
    products: [
        {
            id: 1,
            name: 'Polo T-Shirt',
            brand: 'Royal Wear',
            category: 'Shirts',
            description: 'Premium cotton polo',
            lowStockAlert: 10,
            variants: [
                { id: 101, size: 'M', color: 'Blue', sku: 'POLO-M-BLU', price: 1200, stock: 25 },
                { id: 102, size: 'L', color: 'Blue', sku: 'POLO-L-BLU', price: 1200, stock: 5 },
            ]
        },
        {
            id: 2,
            name: 'Slim Fit Jeans',
            brand: 'Denim Co',
            category: 'Jeans',
            description: 'Stretchable blue jeans',
            lowStockAlert: 5,
            variants: [
                { id: 201, size: '32', color: 'Dark Blue', sku: 'JEAN-32-BLU', price: 2500, stock: 12 },
            ]
        }
    ],
    stockHistory: [
        { id: 1, productId: 1, variantId: 101, type: 'IN', quantity: 10, date: '2026-02-20' },
        { id: 2, productId: 1, variantId: 102, type: 'OUT', quantity: 2, date: '2026-02-21' },
    ],
    staff: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Staff', status: 'Active' },
    ],

    // ──── Fabrics ────
    fabrics: [
        { id: 1, name: 'Cotton White', totalMeter: 500, usedMeter: 120, pricePerMeter: 150 },
        { id: 2, name: 'Silk Blue', totalMeter: 300, usedMeter: 80, pricePerMeter: 400 },
        { id: 3, name: 'Denim Dark', totalMeter: 700, usedMeter: 250, pricePerMeter: 220 },
    ],
    fabricProducts: [
        { id: 1, name: 'Cotton Kurta', fabricId: 1, meterPerPiece: 2.5, sellingPrice: 850, stock: 40 },
        { id: 2, name: 'Silk Saree', fabricId: 2, meterPerPiece: 5.5, sellingPrice: 3200, stock: 15 },
        { id: 3, name: 'Denim Jacket', fabricId: 3, meterPerPiece: 3, sellingPrice: 1800, stock: 25 },
    ],
    shops: [
        { id: 1, name: 'Cloth Inventory', owner: 'Rahul Sharma', contact: '9876543210', address: 'MG Road, Delhi' },
        { id: 2, name: 'Style Point', owner: 'Priya Patel', contact: '9123456780', address: 'Station Rd, Mumbai' },
    ],
    sales: [
        { id: 1, shopId: 1, fabricProductId: 1, quantity: 5, totalAmount: 4250, date: '2026-02-20' },
        { id: 2, shopId: 2, fabricProductId: 3, quantity: 3, totalAmount: 5400, date: '2026-02-21' },
    ],
    productionLog: [
        { id: 1, fabricProductId: 1, fabricId: 1, quantity: 10, meterUsed: 25, date: '2026-02-19' },
        { id: 2, fabricProductId: 3, fabricId: 3, quantity: 5, meterUsed: 15, date: '2026-02-20' },
    ],

    // ──── Customer Tracking ────
    customers: [
        { id: 1, name: 'Amit Kumar', contact: '9988776655', shopId: 1, address: 'Sector 15, Noida' },
        { id: 2, name: 'Sneha Gupta', contact: '8877665544', shopId: 1, address: 'Lajpat Nagar, Delhi' },
        { id: 3, name: 'Ravi Desai', contact: '7766554433', shopId: 2, address: 'Andheri West, Mumbai' },
    ],
    customerPurchases: [
        { id: 1, customerId: 1, shopId: 1, fabricProductId: 1, quantity: 3, totalAmount: 2550, date: '2026-02-20' },
        { id: 2, customerId: 2, shopId: 1, fabricProductId: 3, quantity: 2, totalAmount: 3600, date: '2026-02-21' },
        { id: 3, customerId: 3, shopId: 2, fabricProductId: 2, quantity: 1, totalAmount: 3200, date: '2026-02-22' },
    ],

    // ──── Supplier Orders (Raw Cloth) ────
    supplierOrders: [
        {
            id: 1, supplierName: 'Textile India Pvt', clothType: 'Cotton White', quantityOrdered: 200,
            pricePerUnit: 150, totalAmount: 30000, orderDate: '2026-02-10', expectedDelivery: '2026-02-18',
            quantityReceived: 200, status: 'Fully Received'
        },
        {
            id: 2, supplierName: 'Silk World', clothType: 'Silk Blue', quantityOrdered: 100,
            pricePerUnit: 400, totalAmount: 40000, orderDate: '2026-02-15', expectedDelivery: '2026-02-22',
            quantityReceived: 60, status: 'Partially Received'
        },
        {
            id: 3, supplierName: 'Denim House', clothType: 'Denim Dark', quantityOrdered: 300,
            pricePerUnit: 220, totalAmount: 66000, orderDate: '2026-02-20', expectedDelivery: '2026-02-28',
            quantityReceived: 0, status: 'Pending'
        },
    ],

    // ──── Dispatches (Admin → Shops) ────
    dispatches: [
        {
            id: 1, shopId: 1, fabricProductId: 1, productName: 'Cotton Kurta', shopName: 'Cloth Inventory',
            quantitySent: 15, quantityReceived: 15, dispatchDate: '2026-02-20', status: 'Delivered'
        },
        {
            id: 2, shopId: 1, fabricProductId: 3, productName: 'Denim Jacket', shopName: 'Cloth Inventory',
            quantitySent: 10, quantityReceived: 0, dispatchDate: '2026-02-22', status: 'Pending'
        },
        {
            id: 3, shopId: 2, fabricProductId: 2, productName: 'Silk Saree', shopName: 'Style Point',
            quantitySent: 8, quantityReceived: 5, dispatchDate: '2026-02-21', status: 'Partially Delivered'
        },
    ],

    // ──── Shop Stock (per shop × per product) ────
    shopStock: [
        { id: 1, shopId: 1, fabricProductId: 1, productName: 'Cotton Kurta', currentStock: 12, sellingPrice: 850, lowStockThreshold: 5 },
        { id: 2, shopId: 1, fabricProductId: 3, productName: 'Denim Jacket', currentStock: 5, sellingPrice: 1800, lowStockThreshold: 3 },
        { id: 3, shopId: 2, fabricProductId: 2, productName: 'Silk Saree', currentStock: 5, sellingPrice: 3200, lowStockThreshold: 3 },
        { id: 4, shopId: 2, fabricProductId: 1, productName: 'Cotton Kurta', currentStock: 8, sellingPrice: 850, lowStockThreshold: 5 },
    ],

    // ──── Store Bills (from shop billing) ────
    storeBills: [
        {
            id: 1, billId: 'BILL-2026-0001', shopId: 1, shopName: 'Cloth Inventory',
            customerName: 'Amit Kumar', customerPhone: '9988776655',
            items: [{ fabricProductId: 1, productName: 'Cotton Kurta', quantity: 3, pricePerUnit: 850, total: 2550 }],
            subtotal: 2550, gst: 127.5, discount: 0, totalAmount: 2677.5,
            date: '2026-02-22', time: '10:30 AM',
            paymentMethod: 'cash', paymentStatus: 'Paid', transactionId: null
        },
        {
            id: 2, billId: 'BILL-2026-0002', shopId: 1, shopName: 'Cloth Inventory',
            customerName: 'Sneha Gupta', customerPhone: '8877665544',
            items: [
                { fabricProductId: 3, productName: 'Denim Jacket', quantity: 1, pricePerUnit: 1800, total: 1800 },
                { fabricProductId: 1, productName: 'Cotton Kurta', quantity: 2, pricePerUnit: 850, total: 1700 },
            ],
            subtotal: 3500, gst: 175, discount: 200, totalAmount: 3475,
            date: '2026-02-23', time: '02:15 PM',
            paymentMethod: 'upi', paymentStatus: 'Paid', transactionId: 'UPI-TXN-9384756'
        },
        {
            id: 3, billId: 'BILL-2026-0003', shopId: 1, shopName: 'Cloth Inventory',
            customerName: 'Walk-in Customer', customerPhone: '',
            items: [{ fabricProductId: 1, productName: 'Cotton Kurta', quantity: 1, pricePerUnit: 850, total: 850 }],
            subtotal: 850, gst: 42.5, discount: 0, totalAmount: 892.5,
            date: '2026-02-24', time: '11:45 AM',
            paymentMethod: 'cash', paymentStatus: 'Paid', transactionId: null
        },
        {
            id: 4, billId: 'BILL-2026-0004', shopId: 2, shopName: 'Style Point',
            customerName: 'Ravi Desai', customerPhone: '7766554433',
            items: [{ fabricProductId: 2, productName: 'Silk Saree', quantity: 2, pricePerUnit: 3200, total: 6400 }],
            subtotal: 6400, gst: 320, discount: 500, totalAmount: 6220,
            date: '2026-02-23', time: '04:00 PM',
            paymentMethod: 'card', paymentStatus: 'Paid', transactionId: 'CARD-TXN-1029384'
        },
        {
            id: 5, billId: 'BILL-2026-0005', shopId: 2, shopName: 'Style Point',
            customerName: 'Pooja Mehta', customerPhone: '9090909090',
            items: [
                { fabricProductId: 1, productName: 'Cotton Kurta', quantity: 4, pricePerUnit: 850, total: 3400 },
                { fabricProductId: 2, productName: 'Silk Saree', quantity: 1, pricePerUnit: 3200, total: 3200 },
            ],
            subtotal: 6600, gst: 330, discount: 300, totalAmount: 6630,
            date: '2026-02-24', time: '12:30 PM',
            paymentMethod: 'upi', paymentStatus: 'Paid', transactionId: 'UPI-TXN-5678901'
        },
    ],

    // ──── Product Master (Master Inventory with SKUs) ────
    productMaster: seedProductMaster,
    skuCounter: seedProductMaster.length + 1,
};

// Helper: Generate SKU
// Format: CAT-BRAND-SIZE-AUTONUMBER
export const generateSKU = (category, brand, size, counter) => {
    const cat = category.substring(0, 2).toUpperCase();
    const br = brand.substring(0, 3).toUpperCase();
    const sz = size.toString().toUpperCase();
    const num = counter.toString().padStart(5, '0');
    return `${cat}-${br}-${sz}-${num}`;
};

function adminReducer(state, action) {
    switch (action.type) {
        // Categories
        case 'ADD_CATEGORY':
            return { ...state, categories: [...state.categories, { ...action.payload, id: Date.now() }] };
        case 'UPDATE_CATEGORY':
            return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) };
        case 'DELETE_CATEGORY':
            return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };

        // Products
        case 'ADD_PRODUCT':
            return { ...state, products: [...state.products, { ...action.payload, id: Date.now() }] };
        case 'UPDATE_PRODUCT':
            return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) };
        case 'DELETE_PRODUCT':
            return { ...state, products: state.products.filter(p => p.id !== action.payload) };

        // Stock
        case 'ADJUST_STOCK': {
            const { productId, variantId, type, quantity } = action.payload;
            const amount = type === 'IN' ? quantity : -quantity;

            const updatedProducts = state.products.map(p => {
                if (p.id === productId) {
                    const updatedVariants = p.variants.map(v => {
                        if (v.id === variantId) {
                            return { ...v, stock: v.stock + amount };
                        }
                        return v;
                    });
                    return { ...p, variants: updatedVariants };
                }
                return p;
            });

            const newHistory = {
                id: Date.now(),
                productId,
                variantId,
                type,
                quantity,
                date: new Date().toISOString().split('T')[0]
            };

            return { ...state, products: updatedProducts, stockHistory: [newHistory, ...state.stockHistory] };
        }

        // Staff
        case 'ADD_STAFF':
            return { ...state, staff: [...state.staff, { ...action.payload, id: Date.now() }] };
        case 'UPDATE_STAFF':
            return { ...state, staff: state.staff.map(s => s.id === action.payload.id ? action.payload : s) };
        case 'DELETE_STAFF':
            return { ...state, staff: state.staff.filter(s => s.id !== action.payload) };

        // ──── Fabrics ────
        case 'ADD_FABRIC':
            return { ...state, fabrics: [...state.fabrics, { ...action.payload, id: Date.now(), usedMeter: 0 }] };
        case 'UPDATE_FABRIC':
            return { ...state, fabrics: state.fabrics.map(f => f.id === action.payload.id ? action.payload : f) };
        case 'DELETE_FABRIC':
            return { ...state, fabrics: state.fabrics.filter(f => f.id !== action.payload) };

        // ──── Fabric Products ────
        case 'ADD_FABRIC_PRODUCT':
            return { ...state, fabricProducts: [...state.fabricProducts, { ...action.payload, id: Date.now(), stock: 0 }] };
        case 'UPDATE_FABRIC_PRODUCT':
            return { ...state, fabricProducts: state.fabricProducts.map(p => p.id === action.payload.id ? action.payload : p) };
        case 'DELETE_FABRIC_PRODUCT':
            return { ...state, fabricProducts: state.fabricProducts.filter(p => p.id !== action.payload) };

        // ──── Production ────
        case 'PRODUCE': {
            const { fabricProductId, fabricId, quantity, meterUsed } = action.payload;
            return {
                ...state,
                fabrics: state.fabrics.map(f =>
                    f.id === fabricId ? { ...f, usedMeter: f.usedMeter + meterUsed } : f
                ),
                fabricProducts: state.fabricProducts.map(p =>
                    p.id === fabricProductId ? { ...p, stock: p.stock + quantity } : p
                ),
                productionLog: [
                    { id: Date.now(), fabricProductId, fabricId, quantity, meterUsed, date: new Date().toISOString().split('T')[0] },
                    ...state.productionLog
                ]
            };
        }

        // ──── Shops ────
        case 'ADD_SHOP':
            return { ...state, shops: [...state.shops, { ...action.payload, id: Date.now() }] };
        case 'UPDATE_SHOP':
            return { ...state, shops: state.shops.map(s => s.id === action.payload.id ? action.payload : s) };
        case 'DELETE_SHOP':
            return { ...state, shops: state.shops.filter(s => s.id !== action.payload) };

        // ──── Sales (kept for backward compat) ────
        case 'ADD_SALE': {
            const { fabricProductId: saleProductId, quantity: saleQty, totalAmount, shopId } = action.payload;
            return {
                ...state,
                fabricProducts: state.fabricProducts.map(p =>
                    p.id === saleProductId ? { ...p, stock: p.stock - saleQty } : p
                ),
                storeBills: [action.payload, ...state.storeBills],
                sales: [
                    { id: Date.now(), shopId, fabricProductId: saleProductId, quantity: saleQty, totalAmount, date: new Date().toISOString().split('T')[0] },
                    ...state.sales
                ]
            };
        }

        // ──── Product Master Management ────
        case 'ADD_MASTER_PRODUCT':
            return {
                ...state,
                productMaster: [action.payload, ...state.productMaster],
                skuCounter: state.skuCounter + 1
            };
        case 'BULK_ADD_MASTER_PRODUCTS':
            return {
                ...state,
                productMaster: [...action.payload, ...state.productMaster],
                skuCounter: state.skuCounter + action.payload.length
            };
        case 'DELETE_MASTER_PRODUCT':
            return {
                ...state,
                productMaster: state.productMaster.filter(p => p.id !== action.payload)
            };
        case 'UPDATE_MASTER_PRODUCT':
            return {
                ...state,
                productMaster: state.productMaster.map(p => p.id === action.payload.id ? action.payload : p)
            };

        // ──── Customers ────
        case 'ADD_CUSTOMER':
            return { ...state, customers: [...state.customers, { ...action.payload, id: Date.now() }] };
        case 'UPDATE_CUSTOMER':
            return { ...state, customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c) };
        case 'DELETE_CUSTOMER':
            return { ...state, customers: state.customers.filter(c => c.id !== action.payload) };

        // ──── Customer Purchases ────
        case 'ADD_CUSTOMER_PURCHASE': {
            const { fabricProductId: cpProductId, quantity: cpQty, totalAmount: cpAmount, customerId, shopId: cpShopId } = action.payload;
            return {
                ...state,
                fabricProducts: state.fabricProducts.map(p =>
                    p.id === cpProductId ? { ...p, stock: p.stock - cpQty } : p
                ),
                customerPurchases: [
                    { id: Date.now(), customerId, shopId: cpShopId, fabricProductId: cpProductId, quantity: cpQty, totalAmount: cpAmount, date: new Date().toISOString().split('T')[0] },
                    ...state.customerPurchases
                ]
            };
        }

        // ──── Supplier Orders ────
        case 'ADD_SUPPLIER_ORDER':
            return {
                ...state,
                supplierOrders: [
                    ...state.supplierOrders,
                    { ...action.payload, id: Date.now(), quantityReceived: 0, status: 'Pending' }
                ]
            };

        case 'RECEIVE_SUPPLIER_ORDER': {
            const { orderId, receivedQty } = action.payload;
            return {
                ...state,
                supplierOrders: state.supplierOrders.map(o => {
                    if (o.id !== orderId) return o;
                    const newReceived = o.quantityReceived + receivedQty;
                    let status = 'Pending';
                    if (newReceived >= o.quantityOrdered) status = 'Fully Received';
                    else if (newReceived > 0) status = 'Partially Received';
                    return { ...o, quantityReceived: newReceived, status };
                }),
                // Also update fabric totalMeter if matching cloth type
                fabrics: state.fabrics.map(f => {
                    const order = state.supplierOrders.find(o => o.id === orderId);
                    if (order && f.name === order.clothType) {
                        return { ...f, totalMeter: f.totalMeter + receivedQty };
                    }
                    return f;
                })
            };
        }

        // ──── Dispatches ────
        case 'ADD_DISPATCH': {
            const { shopId: dShopId, fabricProductId: dProductId, quantitySent } = action.payload;
            const shop = state.shops.find(s => s.id === dShopId);
            const product = state.fabricProducts.find(p => p.id === dProductId);
            return {
                ...state,
                fabricProducts: state.fabricProducts.map(p =>
                    p.id === dProductId ? { ...p, stock: p.stock - quantitySent } : p
                ),
                dispatches: [
                    ...state.dispatches,
                    {
                        id: Date.now(), shopId: dShopId, fabricProductId: dProductId,
                        productName: product?.name || '', shopName: shop?.name || '',
                        quantitySent, quantityReceived: 0,
                        dispatchDate: new Date().toISOString().split('T')[0],
                        status: 'Pending'
                    }
                ]
            };
        }

        // ──── Store Receives Dispatch ────
        case 'RECEIVE_DISPATCH': {
            const { dispatchId, receivedQty } = action.payload;
            const dispatch = state.dispatches.find(d => d.id === dispatchId);
            if (!dispatch) return state;

            const newReceived = dispatch.quantityReceived + receivedQty;
            let dStatus = 'Pending';
            if (newReceived >= dispatch.quantitySent) dStatus = 'Delivered';
            else if (newReceived > 0) dStatus = 'Partially Delivered';

            // Update or create shopStock entry
            const existingStock = state.shopStock.find(
                s => s.shopId === dispatch.shopId && s.fabricProductId === dispatch.fabricProductId
            );
            const product = state.fabricProducts.find(p => p.id === dispatch.fabricProductId);

            let updatedShopStock;
            if (existingStock) {
                updatedShopStock = state.shopStock.map(s =>
                    s.id === existingStock.id
                        ? { ...s, currentStock: s.currentStock + receivedQty }
                        : s
                );
            } else {
                updatedShopStock = [
                    ...state.shopStock,
                    {
                        id: Date.now(), shopId: dispatch.shopId, fabricProductId: dispatch.fabricProductId,
                        productName: product?.name || dispatch.productName,
                        currentStock: receivedQty, sellingPrice: product?.sellingPrice || 0
                    }
                ];
            }

            return {
                ...state,
                dispatches: state.dispatches.map(d =>
                    d.id === dispatchId ? { ...d, quantityReceived: newReceived, status: dStatus } : d
                ),
                shopStock: updatedShopStock
            };
        }

        // ──── Store Billing ────
        case 'ADD_STORE_BILL': {
            const { shopId: bShopId, items: billItems } = action.payload;
            // Deduct stock for each item
            let updatedStock = [...state.shopStock];
            billItems.forEach(item => {
                updatedStock = updatedStock.map(s =>
                    s.shopId === bShopId && s.fabricProductId === item.fabricProductId
                        ? { ...s, currentStock: Math.max(0, s.currentStock - item.quantity) }
                        : s
                );
            });

            return {
                ...state,
                shopStock: updatedStock,
                storeBills: [
                    ...state.storeBills,
                    { ...action.payload, id: Date.now() }
                ]
            };
        }

        default:
            return state;
    }
}

export function AdminProvider({ children }) {
    const [state, dispatch] = useReducer(adminReducer, initialState);

    return (
        <AdminContext.Provider value={{ state, dispatch }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) throw new Error('useAdmin must be used within AdminProvider');
    return context;
}
