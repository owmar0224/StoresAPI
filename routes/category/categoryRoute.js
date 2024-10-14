const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/categoryController');
const passport = require('passport');

router.post('/create', passport.authenticate('owner-rule', { session: false }), categoryController.createCategory);
router.get('/all', passport.authenticate('owner-rule', { session: false }), categoryController.getCategories);
router.get('/:id', passport.authenticate('owner-rule', { session: false }), categoryController.getCategoryById);
router.put('/update/:id', passport.authenticate('owner-rule', { session: false }), categoryController.updateCategory);
router.delete('/delete/:id', passport.authenticate('owner-rule', { session: false }), categoryController.deleteCategory);

module.exports = router;