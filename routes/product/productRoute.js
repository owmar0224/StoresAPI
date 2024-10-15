const express = require('express');
const router = express.Router();
const upload = require('../../utilities/multerUtillity');
const productController = require('../../controllers/productController');
const passport = require('passport');

router.post('/create', passport.authenticate('owner-rule', { session: false }), upload.single('image'), productController.createProduct);
router.get('/all', passport.authenticate('owner-rule', { session: false }), productController.getProducts);
router.get('/:id', passport.authenticate('owner-rule', { session: false }), productController.getProductById);
router.put('/update/:id', passport.authenticate('owner-rule', { session: false }), upload.single('image'), productController.updateProduct);
router.delete('/delete/:id', passport.authenticate('owner-rule', { session: false }), productController.deleteProduct);

module.exports = router;