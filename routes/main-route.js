const express = require('express');
const ownerRoutes = require('./owner/ownerRoute');
const router = express.Router();

router.use('/owners', ownerRoutes);

module.exports = router;