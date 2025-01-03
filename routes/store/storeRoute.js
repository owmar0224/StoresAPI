const express = require('express');
const router = express.Router();
const upload = require('../../utilities/multerUtillity');
const storeController = require('../../controllers/storeController');
const passport = require('passport');

// Protected Routes using passport.authenticate
router.post('/create', passport.authenticate('owner-rule', { session: false }), upload.single('image'), storeController.createStore);
router.get('/all', passport.authenticate('owner-rule', { session: false }), storeController.getStores);
router.get('/:id', passport.authenticate('owner-rule', { session: false }), storeController.getStoreById);
router.put('/update/:id', passport.authenticate('owner-rule', { session: false }), upload.single('image'), storeController.updateStore);
router.delete('/delete/:id', passport.authenticate('owner-rule', { session: false }), storeController.deleteStore);

module.exports = router;