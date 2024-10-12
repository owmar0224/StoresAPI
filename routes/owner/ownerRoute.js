const express = require('express');
const router = express.Router();
const ownerController = require('../../controllers/ownerController');
const { verifyToken } = require('../../middlewares/authMiddleware');

// Public Routes
router.post('/register', ownerController.registerOwner);
router.post('/login', ownerController.loginOwner);

// Protected Routes
router.get('/', verifyToken, ownerController.getOwners);
router.get('/:id', verifyToken, ownerController.getOwnerById);
router.put('/update', verifyToken, ownerController.updateOwner);
router.delete('/delete', verifyToken, ownerController.deleteOwner);

module.exports = router;