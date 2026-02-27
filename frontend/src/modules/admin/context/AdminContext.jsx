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
import { useAuth } from '../../../context/AuthContext';

export const generateSKU = (category = 'NA', brand = 'NA', size = 'NA', counter = 1) => {
    const catCode = category.substring(0, 2).toUpperCase() || 'XX';
    const brandCode = brand.substring(0, 2).toUpperCase() || 'XX';
    const sizeCode = size.substring(0, 2).toUpperCase() || 'XX';
    return `${catCode}${brandCode}${sizeCode}-${counter.toString().padStart(4, '0')}`;
};

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
    suppliers: [],
    supplierOrders: [],
    dispatches: [],
    shopStock: [],
    storeBills: [],
    productionBatches: [],
    productionLog: [],
    fabricProducts: [],
    sales: [],
    customers: [],
    customerPurchases: [],
    invoices: [],
    skuCounter: 1,
};

// Helper: Derive unique customers from sales/bills
const deriveInvoices = (dispatches) => {
    const invoices = [];
    const dispatchList = Array.isArray(dispatches) ? dispatches : [];

    dispatchList.forEach(d => {
        const shopName = d.storeId?.name || 'Unknown Shop';
        const date = new Date(d.dispatchDate || d.createdAt).toLocaleDateString();

        (d.products || []).forEach(item => {
            const product = item.productId;
            invoices.push({
                id: d.dispatchNumber || d._id,
                date,
                shopName,
                productName: product?.name || 'Unknown Product',
                fabricType: product?.fabricType || 'Standard',
                quantity: item.quantity,
                pricePerUnit: item.price || product?.salePrice || 0,
                total: item.quantity * (item.price || product?.salePrice || 0)
            });
        });
    });
    return invoices;
};

// Helper: Derive unique customers from sales/bills
const deriveCustomers = (bills) => {
    const customersMap = new Map();
    bills.forEach(bill => {
        if (!bill.customerName || bill.customerName === 'Walk-in Customer') return;
        const phone = bill.customerPhone || 'N/A';
        if (!customersMap.has(phone)) {
            customersMap.set(phone, {
                id: Math.abs(phone.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)),
                name: bill.customerName,
                phone: bill.customerPhone,
                shopId: bill.shopId
            });
        }
    });
    return Array.from(customersMap.values());
};

// Helper: Derive flat purchase records from bills
const derivePurchases = (bills) => {
    const purchases = [];
    bills.forEach(bill => {
        const customer = bill.customerName !== 'Walk-in Customer' ? {
            id: Math.abs((bill.customerPhone || '').split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0))
        } : { id: 0 };

        (bill.items || []).forEach(item => {
            purchases.push({
                id: bill.id + '-' + item.fabricProductId,
                customerId: customer.id,
                shopId: bill.shopId,
                fabricProductId: item.fabricProductId,
                quantity: item.quantity,
                totalAmount: item.total,
                date: bill.date
            });
        });
    });
    return purchases;
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
            const { productMaster, productionBatches, storeBills } = action.payload;
            const pmData = Array.isArray(productMaster) ? productMaster : [];
            const pbData = Array.isArray(productionBatches) ? productionBatches : [];
            const sbData = Array.isArray(storeBills) ? storeBills : [];

            return {
                ...state,
                ...action.payload,
                products: pmData.length > 0 ? groupProducts(pmData) : state.products,
                fabricProducts: pmData.map(p => {
                    const batch = pbData.find(b => b._id === p.batchId || b._id === p.batchId?._id);
                    return {
                        ...p,
                        id: p._id,
                        sellingPrice: p.salePrice,
                        stock: p.factoryStock,
                        fabricId: batch?.fabricId || null,
                        meterPerPiece: batch ? (batch.meterUsed / batch.totalPieces).toFixed(2) : 0
                    };
                }),
                fabrics: Array.isArray(action.payload.fabrics) ? action.payload.fabrics.map(f => ({
                    ...f,
                    id: f._id,
                    name: f.fabricType,
                    totalMeter: f.meterPurchased,
                    pricePerMeter: f.ratePerMeter,
                    usedMeter: (f.meterPurchased || 0) - (f.meterAvailable || 0)
                })) : state.fabrics,
                shops: Array.isArray(action.payload.shops) ? action.payload.shops.map(s => ({
                    ...s,
                    id: s._id
                })) : state.shops,
                productionLog: pbData.map(b => ({ ...b, id: b._id, fabricProductId: b.fabricId })),
                sales: sbData,
                productionBatches: pbData,
                storeBills: sbData,
                productMaster: pmData,
                customers: deriveCustomers(sbData),
                customerPurchases: derivePurchases(sbData),
                invoices: deriveInvoices(action.payload.dispatches || [])
            };
        case 'REFRESH_PRODUCTS':
            const refreshedPM = Array.isArray(action.payload) ? action.payload : [];
            return {
                ...state,
                productMaster: refreshedPM,
                products: groupProducts(refreshedPM),
                fabricProducts: refreshedPM.map(p => {
                    const batch = state.productionBatches.find(b => b._id === p.batchId || b._id === p.batchId?._id);
                    return {
                        ...p,
                        id: p._id,
                        sellingPrice: p.salePrice,
                        stock: p.factoryStock,
                        fabricId: batch?.fabricId || null,
                        meterPerPiece: batch ? (batch.meterUsed / batch.totalPieces).toFixed(2) : 0
                    };
                })
            };
        case 'ADD_PRODUCTION_BATCH':
            return {
                ...state,
                productionBatches: [...state.productionBatches, action.payload],
                productionLog: [...state.productionLog, { ...action.payload, id: action.payload._id, date: new Date().toLocaleDateString() }]
            };
        case 'MOVE_PRODUCTION_BATCH':
            return {
                ...state,
                productionBatches: state.productionBatches.map(b =>
                    b._id === action.payload.batchId ? { ...b, stage: action.payload.nextStage } : b
                )
            };
        case 'ADD_DISPATCH':
            return {
                ...state,
                dispatches: [...state.dispatches, action.payload]
            };
        case 'RECEIVE_DISPATCH':
            return {
                ...state,
                dispatches: state.dispatches.map(d =>
                    (d._id === action.payload.dispatchId || d.id === action.payload.dispatchId)
                        ? { ...d, status: 'RECEIVED' }
                        : d
                )
            };
        case 'ADD_STORE':
            return {
                ...state,
                shops: [...state.shops, { ...action.payload, id: action.payload._id }]
            };
        case 'DELETE_STORE':
            return {
                ...state,
                shops: state.shops.filter(s => s.id !== action.payload && s._id !== action.payload)
            };
        case 'ADD_INVOICE':
            return {
                ...state,
                invoices: [...state.invoices, action.payload]
            };
        case 'ADD_SUPPLIER_ORDER':
            return {
                ...state,
                supplierOrders: [
                    ...state.supplierOrders,
                    {
                        ...action.payload,
                        id: Date.now(),
                        quantityReceived: 0,
                        status: 'Pending'
                    }
                ]
            };
        case 'RECEIVE_SUPPLIER_ORDER':
            return {
                ...state,
                supplierOrders: state.supplierOrders.map(order =>
                    order.id === action.payload.orderId
                        ? {
                            ...order,
                            quantityReceived: order.quantityReceived + action.payload.receivedQty,
                            status: (order.quantityReceived + action.payload.receivedQty) >= order.quantityOrdered
                                ? 'Fully Received'
                                : 'Partially Received'
                        }
                        : order
                )
            };
        case 'SET_DISPATCHES_INVOICES':
            return {
                ...state,
                dispatches: action.payload.dispatches,
                invoices: action.payload.invoices
            };
        default:
            return state;
    }
}

export function AdminProvider({ children }) {
    const [state, dispatch] = useReducer(adminReducer, initialState);
    const auth = useAuth();

    useEffect(() => {
        if (auth.user !== undefined) {
            dispatch({ type: 'SET_USER', payload: auth.user });
        }
    }, [auth.user]);

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

            if (state.user.role === 'admin') {
                stats = await reportService.getDashboardStats().catch(() => null);
            } else if (state.user.role === 'store_staff') {
                const shopId = state.user.shopId || state.user.storeId;
                shopStock = await storeInventoryService.getShopStock(shopId).catch(() => []);
                storeBills = await salesService.getAll(shopId).catch(() => []);
            }

            dispatch({
                type: 'SET_DATA',
                payload: {
                    productMaster: products,
                    shops: stores,
                    fabrics: Array.isArray(fabrics) ? fabrics : (fabrics?.fabrics || []),
                    suppliers: Array.isArray(suppliers) ? suppliers : (suppliers?.suppliers || []),
                    supplierOrders: state.supplierOrders,
                    productionBatches: Array.isArray(production) ? production : (production?.batches || []),
                    storeBills: Array.isArray(storeBills) ? storeBills : (storeBills?.sales || []),
                    staff: Array.isArray(staff) ? staff : (staff?.staff || []),
                    categories,
                    dispatches: Array.isArray(dispatches) ? dispatches : (dispatches?.dispatches || []),
                    shopStock: Array.isArray(shopStock) ? shopStock : (shopStock?.inventory || []),
                    skuCounter: products.length + 1
                }
            });

            // Map dispatches to invoices and flattened format
            const rawDispatches = Array.isArray(dispatches) ? dispatches : (dispatches?.dispatches || []);
            const flattenedDispatches = rawDispatches.flatMap(d =>
                (d.products || []).map(item => {
                    const product = item.productId;
                    const date = new Date(d.dispatchDate || d.createdAt).toLocaleDateString();
                    return {
                        ...d,
                        id: d.dispatchNumber || d._id,
                        lineId: `${d._id}-${product?._id}`,
                        shopId: d.storeId?._id || d.storeId,
                        shopName: d.storeId?.name || 'Unknown',
                        productName: product?.name || 'Unknown',
                        fabricType: product?.fabricType || 'Standard',
                        quantity: item.quantity,
                        quantitySent: item.quantity,
                        quantityReceived: d.status === 'RECEIVED' ? item.quantity : 0,
                        pricePerUnit: item.price || product?.salePrice || 0,
                        total: item.quantity * (item.price || product?.salePrice || 0),
                        date,
                        dispatchDate: date
                    };
                })
            );

            dispatch({
                type: 'SET_DISPATCHES_INVOICES',
                payload: { dispatches: flattenedDispatches, invoices: flattenedDispatches }
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

    const addFabric = async (fabricData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            // Map frontend names back to backend
            const backendData = {
                fabricType: fabricData.name,
                meterPurchased: parseFloat(fabricData.totalMeter),
                ratePerMeter: parseFloat(fabricData.pricePerMeter),
                supplierId: fabricData.supplierId,
                invoiceNumber: fabricData.invoiceNumber,
                color: fabricData.color,
                gsm: fabricData.gsm,
                notes: fabricData.notes
            };

            if (!backendData.supplierId) throw new Error('Supplier is required');
            if (!backendData.invoiceNumber) throw new Error('Invoice Number is required');

            await fabricService.create(backendData);
            await fetchData();
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to add fabric';
            dispatch({ type: 'SET_ERROR', payload: msg });
            return { success: false, message: msg };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const updateFabric = async (id, fabricData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const backendData = {
                fabricType: fabricData.name,
                meterPurchased: fabricData.totalMeter,
                ratePerMeter: fabricData.pricePerMeter
            };
            await fabricService.update(id, backendData);
            await fetchData();
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update fabric';
            dispatch({ type: 'SET_ERROR', payload: msg });
            return { success: false, message: msg };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const deleteFabric = async (id) => {
        try {
            await fabricService.delete(id);
            await fetchData();
            return true;
        } catch (err) {
            return false;
        }
    };

    const addProductionBatch = async (batchData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const res = await productionService.create(batchData);
            dispatch({ type: 'ADD_PRODUCTION_BATCH', payload: res.batch });
            await fetchData();
            return { success: true };
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Failed to start production' });
            return { success: false };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const moveProductionStage = async (batchId, nextStage, metadata = null) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const stage = nextStage.toUpperCase();
            const payload = { stage };
            if (stage === 'READY' && metadata) payload.productMetadata = metadata;

            await productionService.moveStage(batchId, stage, metadata);
            dispatch({ type: 'MOVE_PRODUCTION_BATCH', payload: { batchId, nextStage: stage } });
            await fetchData();
            return { success: true };
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Failed to update stage' });
            return { success: false };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const addDispatch = async (dispatchData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const res = await dispatchService.create(dispatchData);
            dispatch({ type: 'ADD_DISPATCH', payload: res.dispatch });
            await fetchData();
            return { success: true, dispatchId: res.dispatch._id };
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Failed to dispatch' });
            return { success: false };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const receiveDispatch = async (dispatchId) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await dispatchService.receive(dispatchId);
            dispatch({ type: 'RECEIVE_DISPATCH', payload: { dispatchId } });
            await fetchData();
            return { success: true };
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Failed to receive dispatch' });
            return { success: false };
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
            addFabric,
            updateFabric,
            deleteFabric,
            addProductionBatch,
            moveProductionStage,
            addDispatch,
            receiveDispatch,
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
