import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { seedProductMaster } from '../../data/products';
import authService from '../../../services/authService';
import productService from '../../../services/productService';
import storeService from '../../../services/storeService';
import fabricService from '../../../services/fabricService';
import supplierService from '../../../services/supplierService';
import productionService from '../../../services/productionService';
import dispatchService from '../../../services/dispatchService';
import reportService from '../../../services/reportService';
import storeInventoryService from '../../../services/storeInventoryService';
import salesService from '../../../services/salesService';
import staffService from '../../../services/staffService';
import categoryService from '../../../services/categoryService';

const AdminContext = createContext();

const initialState = {
    user: authService.getCurrentUser(),
    loading: false,
    error: null,
    categories: [],
    products: [],
    stockHistory: [],
    staff: [],

    // ──── Fabrics ────
    fabrics: [],
    fabricProducts: [],
    shops: [],
    sales: [],
    productionLog: [],

    // ──── Customer Tracking ────
    customers: [],
    customerPurchases: [],

    // ──── Supplier Orders (Raw Cloth) ────
    supplierOrders: [],

    // ──── Dispatches (Admin → Shops) ────
    dispatches: [],

    // ──── Shop Stock (per shop × per product) ────
    shopStock: [],

    // ──── Store Bills (from shop billing) ────
    storeBills: [],

    // ──── Production Workflow (Modern Stops) ────
    productionBatches: [],

    // ──── Invoices ────
    invoices: [],

    // ──── Product Master (Master Inventory with SKUs) ────
    productMaster: [],
    skuCounter: 1,
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
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_DATA':
            return { ...state, ...action.payload };

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

            const diff = action.payload.difference || 0;

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
                    d.id === dispatchId ? {
                        ...d,
                        quantityReceived: newReceived,
                        status: dStatus,
                        lastDifference: diff
                    } : d
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

        // ──── New Production Workflow Actions ────
        case 'ADD_PRODUCTION_BATCH':
            return {
                ...state,
                productionBatches: [
                    ...state.productionBatches,
                    { ...action.payload, id: Date.now(), status: 'material', date: new Date().toISOString().split('T')[0] }
                ]
            };

        case 'MOVE_PRODUCTION_BATCH': {
            const { batchId, nextStatus } = action.payload;
            return {
                ...state,
                productionBatches: state.productionBatches.map(b =>
                    b.id === batchId ? { ...b, status: nextStatus } : b
                )
            };
        }

        case 'COMPLETE_PRODUCTION_BATCH': {
            const { batchId, productId, quantity } = action.payload;
            return {
                ...state,
                productionBatches: state.productionBatches.filter(b => b.id !== batchId),
                fabricProducts: state.fabricProducts.map(p =>
                    p.id === productId ? { ...p, stock: p.stock + quantity } : p
                )
            };
        }

        // ──── Invoices ────
        case 'ADD_INVOICE':
            return {
                ...state,
                invoices: [...state.invoices, action.payload]
            };

        default:
            return state;
    }
}

export function AdminProvider({ children }) {
    const [state, dispatch] = useReducer(adminReducer, initialState);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!state.user) return;

            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const results = await Promise.all([
                    productService.getAll(),
                    storeService.getAll(),
                    fabricService.getAll(),
                    supplierService.getAll(),
                    productionService.getAll(),
                    dispatchService.getAll(),
                    state.user.role === 'Admin' ? reportService.getDashboardStats() : Promise.resolve(null),
                    state.user.role === 'Store' ? storeInventoryService.getShopStock(state.user.shopId) : Promise.resolve([]),
                    state.user.role === 'Store' ? salesService.getShopHistory(state.user.shopId) : Promise.resolve([]),
                    staffService.getAll(),
                    categoryService.getAll()
                ]);

                const [products, stores, fabrics, suppliers, production, dispatches, stats, shopStock, storeBills, staff, categories] = results;

                dispatch({
                    type: 'SET_DATA',
                    payload: {
                        products: products || [],
                        shops: stores || [],
                        fabrics: fabrics || [],
                        supplierOrders: suppliers || [],
                        productionBatches: production || [],
                        dispatches: dispatches || [],
                        dashboardStats: stats || null,
                        shopStock: shopStock || [],
                        storeBills: storeBills || [],
                        staff: staff || [],
                        categories: categories || []
                    }
                });
            } catch (err) {
                dispatch({ type: 'SET_ERROR', payload: 'Failed to load data from backend.' });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        fetchInitialData();
    }, [state.user]);

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
