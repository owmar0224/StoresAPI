const express = require('express');
const ownerRoutes = require('./owner/ownerRoute');
const storeRoutes = require('./store/storeRoute');
const categoryRoutes = require('./category/categoryRoute');
const router = express.Router();

router.use('/owners', ownerRoutes);
router.use('/stores', storeRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;