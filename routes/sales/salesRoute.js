const express = require('express');
const router = express.Router();
const salesController = require('../../controllers/salesController');
const passport = require('passport');

router.post('/create', passport.authenticate('owner-rule', { session: false }), salesController.createSale);
router.get('/all', passport.authenticate('owner-rule', { session: false }), salesController.getSales);
router.get('/:id', passport.authenticate('owner-rule', { session: false }), salesController.getSaleById);
router.get('/stores/:store_id', passport.authenticate('owner-rule', { session: false }), salesController.getSalesByStoreId);
router.get('/products/:product_id', passport.authenticate('owner-rule', { session: false }), salesController.getSalesByProductId);
router.put('/update/:id', passport.authenticate('owner-rule', { session: false }), salesController.updateSale);
router.delete('/delete/:id', passport.authenticate('owner-rule', { session: false }), salesController.deleteSale);

module.exports = router;
