const express = require('express');
const { adminRegister, adminLogin, storeRegister, storeLogin, getMe, logout } = require('./auth.controller');
const { adminRegisterValidation, loginValidation, storeRegisterValidation } = require('./auth.validation');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Admin
router.post('/admin/register', adminRegisterValidation, adminRegister);
router.post('/admin/login', loginValidation, adminLogin);

// Store Staff
router.post('/store/register', storeRegisterValidation, storeRegister);
router.post('/store/login', loginValidation, storeLogin);

// Shared protected
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
