const express = require('express');
const router = express.Router();
const ownerController = require('../../controllers/ownerController');
const passport = require('passport');

// Public Routes
router.post('/register', ownerController.registerOwner);
router.post('/login', ownerController.loginOwner);

// Protected Routes using passport.authenticate
router.get('/all', passport.authenticate('jwt', { session: false }), ownerController.getOwners);
router.get('/:id', passport.authenticate('jwt', { session: false }), ownerController.getOwnerById);
router.put('/update/:id', passport.authenticate('jwt', { session: false }), ownerController.updateOwner);
router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), ownerController.deleteOwner);

module.exports = router;