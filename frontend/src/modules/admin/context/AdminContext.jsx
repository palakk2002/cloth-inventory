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
    ]
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
