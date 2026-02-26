import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../../../services/auth.service';
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
    products: [],      // Grouped products for dashboard
    productMaster: [],  // Flat products from backend
    stockHistory: [],
    staff: [],
    fabrics: [],
    shops: [],
    supplierOrders: [],
    dispatches: [],
    shopStock: [],
    storeBills: [],
    productionBatches: [],
    skuCounter: 1,
};

// Helper: Group flat products into variants structure for Dashboard
const groupProducts = (flatProducts) => {
    const grouped = {};
    flatProducts.forEach(p => {
        const key = `${p.name}-${p.category}`;
        if (!grouped[key]) {
            grouped[key] = {
                id: key,
                name: p.name,
                category: p.category,
                lowStockAlert: p.minStockLevel || 5,
                variants: []
            };
        }
        grouped[key].variants.push({
            id: p._id,
            sku: p.sku,
            size: p.size,
            color: p.color,
            stock: p.factoryStock,
            price: p.salePrice
        });
    });
    return Object.values(grouped);
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
            const { productMaster } = action.payload;
            return {
                ...state,
                ...action.payload,
                products: productMaster ? groupProducts(productMaster) : state.products
            };
        case 'REFRESH_PRODUCTS':
            return {
                ...state,
                productMaster: action.payload,
                products: groupProducts(action.payload)
            };
        default:
            return state;
    }
}

export function AdminProvider({ children }) {
    const [state, dispatch] = useReducer(adminReducer, initialState);

    const fetchData = useCallback(async () => {
        if (!state.user) return;

        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const [
                products,
                stores,
                fabrics,
                suppliers,
                production,
                dispatches,
                categories,
                staff
            ] = await Promise.all([
                productService.getAll().catch(() => []),
                storeService.getAll().catch(() => []),
                fabricService.getAll().catch(() => []),
                supplierService.getAll().catch(() => []),
                productionService.getAll().catch(() => []),
                dispatchService.getAll().catch(() => []),
                categoryService.getAll().catch(() => []),
                staffService.getAll().catch(() => []) // Might fail as route doesn't exist
            ]);

            // Additional conditional fetches
            let stats = null;
            let shopStock = [];
            let storeBills = [];

            if (state.user.role === 'Admin') {
                stats = await reportService.getDashboardStats().catch(() => null);
            } else if (state.user.role === 'Store') {
                shopStock = await storeInventoryService.getShopStock(state.user.shopId).catch(() => []);
                storeBills = await salesService.getShopHistory(state.user.shopId).catch(() => []);
            }

            dispatch({
                type: 'SET_DATA',
                payload: {
                    productMaster: products,
                    shops: stores,
                    fabrics,
                    supplierOrders: suppliers,
                    productionBatches: production,
                    dispatches,
                    dashboardStats: stats,
                    shopStock,
                    storeBills,
                    staff,
                    categories,
                    skuCounter: products.length + 1
                }
            });
        } catch (err) {
            console.error('Fetch error:', err);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to synchronize with server.' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Actions ──

    const addProduct = async (productData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await productService.create(productData);
            await fetchData(); // Refresh all to stay in sync
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add product';
            dispatch({ type: 'SET_ERROR', payload: msg });
            return { success: false, message: msg };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const deleteProduct = async (id) => {
        try {
            await productService.delete(id);
            await fetchData();
            return true;
        } catch (err) {
            return false;
        }
    };

    const addCategory = async (name) => {
        try {
            await categoryService.create({ name });
            await fetchData();
            return true;
        } catch (err) {
            return false;
        }
    };

    const deleteCategory = async (id) => {
        try {
            await categoryService.delete(id);
            await fetchData();
            return true;
        } catch (err) {
            return false;
        }
    };

    const addStore = async (storeData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await storeService.create(storeData);
            await fetchData();
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add store';
            dispatch({ type: 'SET_ERROR', payload: msg });
            return { success: false, message: msg };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const deleteStore = async (id) => {
        try {
            await storeService.delete(id);
            await fetchData();
            return true;
        } catch (err) {
            return false;
        }
    };

    const createSale = async (saleData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await salesService.create(saleData);
            await fetchData();
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to process sale';
            dispatch({ type: 'SET_ERROR', payload: msg });
            return { success: false, message: msg };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    return (
        <AdminContext.Provider value={{
            state,
            dispatch,
            addProduct,
            deleteProduct,
            addCategory,
            deleteCategory,
            createSale,
            addStore,
            deleteStore,
            refresh: fetchData
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) throw new Error('useAdmin must be used within AdminProvider');
    return context;
}
