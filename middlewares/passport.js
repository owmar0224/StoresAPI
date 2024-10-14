const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const Owner = require('../models/ownerModel');
const Admin = require('../models/adminModel'); // Assuming a separate Admin model
require('dotenv').config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

// Admin strategy
const adminStrategy = new JwtStrategy(options, async (jwt_payload, done) => {
  try {
    const admin = await Admin.findByPk(jwt_payload.id); // Check Admin table
    if (admin) {
      return done(null, admin);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
});

// Owner strategy
const ownerStrategy = new JwtStrategy(options, async (jwt_payload, done) => {
  try {
    const owner = await Owner.findByPk(jwt_payload.id); // Check Owner table
    if (owner) {
      return done(null, owner);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
});

module.exports = (passport) => {
  passport.use('admin-rule', adminStrategy); // Assign a strategy name for admin
  passport.use('owner-rule', ownerStrategy); // Assign a strategy name for owner
};