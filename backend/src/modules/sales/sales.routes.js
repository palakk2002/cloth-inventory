const express = require('express');
const salesController = require('./sales.controller');
const { createSaleValidation } = require('./sales.validation');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/barcode/:barcode', salesController.getProductByBarcode);

router.route('/')
    .post(createSaleValidation, salesController.createSale)
    .get(salesController.getAllSales);

router.get('/:id', salesController.getSaleById);

module.exports = router;
