require('dotenv').config();
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const Owner = require('../models/ownerModel');
const Admin = require('../models/adminModel');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

// Admin strategy
const adminStrategy = new JwtStrategy(options, async (jwt_payload, done) => {
  try {
    const admin = await Admin.findByPk(jwt_payload.id);
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
    const owner = await Owner.findByPk(jwt_payload.id);
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
  passport.use('admin-rule', adminStrategy);
  passport.use('owner-rule', ownerStrategy);
};