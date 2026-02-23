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
import Sales from '../pages/Sales';

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
                <Route path="production" element={<Production />} />
                <Route path="shops" element={<Shops />} />
                <Route path="sales" element={<Sales />} />
                <Route path="staff" element={<Staff />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
}
