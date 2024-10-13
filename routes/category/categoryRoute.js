const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/categoryController');
const passport = require('passport');

router.post('/create', passport.authenticate('jwt', { session: false }), categoryController.createCategory);
router.get('/all', passport.authenticate('jwt', { session: false }), categoryController.getCategories);
router.get('/:id', passport.authenticate('jwt', { session: false }), categoryController.getCategoryById);
router.put('/update/:id', passport.authenticate('jwt', { session: false }), categoryController.updateCategory);
router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), categoryController.deleteCategory);

module.exports = router;