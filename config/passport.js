const passport = require('passport');
const userModel = require('../models/user.js');

passport.use(userModel.createStrategy());

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  userModel.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err));
});

module.exports = passport;
