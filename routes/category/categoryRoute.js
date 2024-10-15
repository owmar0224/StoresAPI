const express = require('express');
const router = express.Router();
const upload = require('../../utilities/multerUtillity');
const categoryController = require('../../controllers/categoryController');
const passport = require('passport');

router.post('/create', passport.authenticate('owner-rule', { session: false }), upload.single('image'), categoryController.createCategory);
router.get('/all', passport.authenticate('owner-rule', { session: false }), categoryController.getCategories);
router.get('/:id', passport.authenticate('owner-rule', { session: false }), categoryController.getCategoryById);
router.get('/store/:store_id', passport.authenticate('owner-rule', { session: false }), categoryController.getCategoriesByStoreId);
router.put('/update/:id', passport.authenticate('owner-rule', { session: false }), upload.single('image'), categoryController.updateCategory);
router.delete('/delete/:id', passport.authenticate('owner-rule', { session: false }), categoryController.deleteCategory);

module.exports = router;