const express = require('express');
const adminRoutes = require('./admin/adminRoute');
const ownerRoutes = require('./owner/ownerRoute');
const storeRoutes = require('./store/storeRoute');
const categoryRoutes = require('./category/categoryRoute');
const productRoutes = require('./product/productRoute');
const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/owners', ownerRoutes);
router.use('/stores', storeRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

module.exports = router;