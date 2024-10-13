const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const Owner = require('../models/ownerModel');
require('dotenv').config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
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
    })
  );
};