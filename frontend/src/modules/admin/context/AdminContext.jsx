import React, { createContext, useContext, useReducer, useEffect } from 'react';

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

    // ──── New State Slices ────
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
        { id: 1, name: 'Fashion Hub', owner: 'Rahul Sharma', contact: '9876543210', address: 'MG Road, Delhi' },
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

        // ──── Sales ────
        case 'ADD_SALE': {
            const { fabricProductId: saleProductId, quantity: saleQty, totalAmount, shopId } = action.payload;
            return {
                ...state,
                fabricProducts: state.fabricProducts.map(p =>
                    p.id === saleProductId ? { ...p, stock: p.stock - saleQty } : p
                ),
                sales: [
                    { id: Date.now(), shopId, fabricProductId: saleProductId, quantity: saleQty, totalAmount, date: new Date().toISOString().split('T')[0] },
                    ...state.sales
                ]
            };
        }

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
