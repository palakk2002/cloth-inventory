import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './modules/admin/context/AdminContext';
import { AuthProvider } from './context/AuthContext';
import AdminRoutes from './modules/admin/routes/AdminRoutes';
import StoreRoutes from './modules/store/StoreRoutes';

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/store/*" element={<StoreRoutes />} />
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
