/**
 * routes.js — Central route loader
 */

const authRoutes = require('./modules/auth/auth.routes');

const registerRoutes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/stores', require('./modules/stores/store.routes'));
    app.use('/api/suppliers', require('./modules/suppliers/supplier.routes'));
    app.use('/api/fabrics', require('./modules/fabrics/fabric.routes'));
    app.use('/api/production', require('./modules/production/production.routes'));
    app.use('/api/products', require('./modules/products/product.routes'));
    app.use('/api/barcodes', require('./modules/barcodes/barcode.routes'));
    app.use('/api/dispatch', require('./modules/dispatch/dispatch.routes'));
    app.use('/api/store-inventory', require('./modules/storeInventory/storeInventory.routes'));
    app.use('/api/sales', require('./modules/sales/sales.routes'));
    app.use('/api/returns', require('./modules/returns/return.routes'));
    app.use('/api/reports', require('./modules/reports/report.routes'));
    app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));
};

module.exports = registerRoutes;
