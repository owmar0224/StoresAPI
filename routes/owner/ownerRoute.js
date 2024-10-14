const express = require('express');
const router = express.Router();
const ownerController = require('../../controllers/ownerController');
const passport = require('passport');

// Public Routes
router.post('/login', ownerController.loginOwner);

// Protected Routes using passport.authenticate
router.put('/change-password', passport.authenticate('owner-rule', { session: false }), ownerController.changePassword);
router.get('/details', passport.authenticate('owner-rule', { session: false }), ownerController.getOwnerDetails);
router.put('/update', passport.authenticate('owner-rule', { session: false }), ownerController.updateOwner);
router.put('/deactivate', passport.authenticate('owner-rule', { session: false }), ownerController.deactivateOwner);

module.exports = router;