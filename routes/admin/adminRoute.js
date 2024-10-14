const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminControllers/adminController');
const passport = require('passport');

// Public Routes for Admins
router.post('/register', adminController.registerAdmin);
router.post('/resend-verification', adminController.resendVerification);
router.post('/verify', adminController.verifyAdmin);
router.post('/login', adminController.loginAdmin);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/reset-password', adminController.resetPassword);

// Protected Routes (Admins only)
router.post('/change-password', passport.authenticate('admin-rule', { session: false }), adminController.changePassword);
router.get('/all', passport.authenticate('admin-rule', { session: false }), adminController.getAdmins);
router.get('/:id', passport.authenticate('admin-rule', { session: false }), adminController.getAdminById);
router.put('/update/:id', passport.authenticate('admin-rule', { session: false }), adminController.updateAdmin);
router.delete('/delete/:id', passport.authenticate('admin-rule', { session: false }), adminController.deleteAdmin);

router.post('/owners/register', passport.authenticate('admin-rule', { session: false }), adminController.registerOwner);
router.put('/owners/reset-password', passport.authenticate('admin-rule', { session: false }), adminController.resetOwnerPassword);
router.get('/owners/all', passport.authenticate('admin-rule', { session: false }), adminController.getOwners);
router.get('/owners/:id', passport.authenticate('admin-rule', { session: false }), adminController.getOwnerById);
router.delete('/owners/delete/:id', passport.authenticate('admin-rule', { session: false }), adminController.deleteOwner);

module.exports = router;