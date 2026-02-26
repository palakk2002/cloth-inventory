import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StoreLayout from './StoreLayout';
import StoreDashboard from './StoreDashboard';
import ReceiveStock from './ReceiveStock';
import ShopStock from './ShopStock';
import SalesHistory from './SalesHistory';
import InvoiceHistory from './InvoiceHistory';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

export default function StoreRoutes() {
    return (
        <Routes>
            {/* Auth Routes - No Layout */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Main Store Routes with Layout */}
            <Route path="/" element={<StoreLayout />}>
                <Route index element={<Navigate to="pos" replace />} />
                <Route path="pos" element={<StoreDashboard />} />
                <Route path="receive" element={<ReceiveStock />} />
                <Route path="stock" element={<ShopStock />} />
                <Route path="sales-history" element={<SalesHistory />} />
                <Route path="invoice-history" element={<InvoiceHistory />} />
                <Route path="*" element={<Navigate to="pos" replace />} />
            </Route>
        </Routes>
    );
}
