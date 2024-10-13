const express = require('express');
const ownerRoutes = require('./owner/ownerRoute');
const storeRoutes = require('./store/storeRoute');
const router = express.Router();

router.use('/owners', ownerRoutes);
router.use('/stores', storeRoutes);

module.exports = router;