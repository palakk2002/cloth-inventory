import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import Products from '../pages/Products';
import StockManagement from '../pages/StockManagement';
import Staff from '../pages/Staff';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Fabrics from '../pages/Fabrics';
import Production from '../pages/Production';
import Shops from '../pages/Shops';
import Dispatch from '../pages/Dispatch';
import SupplierOrders from '../pages/SupplierOrders';
import CustomerManagement from '../pages/CustomerManagement';
import SalesOverview from '../pages/SalesOverview';
import ProductMaster from '../pages/ProductMaster';
import BulkUpload from '../pages/BulkUpload';

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route path="/" element={<AdminLayout />}>
                <Route index element={<Navigate to="login" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="categories" element={<Categories />} />
                <Route path="products" element={<Products />} />
                <Route path="stock" element={<StockManagement />} />
                <Route path="fabrics" element={<Fabrics />} />
                <Route path="supplier-orders" element={<SupplierOrders />} />
                <Route path="production" element={<Production />} />
                <Route path="shops" element={<Shops />} />
                <Route path="dispatch" element={<Dispatch />} />
                <Route path="sales-overview" element={<SalesOverview />} />
                <Route path="product-master" element={<ProductMaster />} />
                <Route path="bulk-upload" element={<BulkUpload />} />
                <Route path="customer-management" element={<CustomerManagement />} />
                <Route path="staff" element={<Staff />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
}
