const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

router.use(protect);

router.get('/', categoryController.getAllCategories);
router.post('/', requireRole('admin'), categoryController.createCategory);
router.delete('/:id', requireRole('admin'), categoryController.deleteCategory);

module.exports = router;
