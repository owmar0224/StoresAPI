const express = require('express');
const router = express.Router();
const storeController = require('../../controllers/storeController');
const passport = require('passport');

// Protected Routes using passport.authenticate
router.post('/create', passport.authenticate('jwt', { session: false }), storeController.createStore);
router.get('/all', passport.authenticate('jwt', { session: false }), storeController.getStores);
router.get('/:id', passport.authenticate('jwt', { session: false }), storeController.getStoreById);
router.put('/update/:id', passport.authenticate('jwt', { session: false }), storeController.updateStore);
router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), storeController.deleteStore);

module.exports = router;