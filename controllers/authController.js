const passport = require('passport');
const userModel = require('../models/user.js');

let msg = "";

exports.getLogin = (req, res) => res.render("login", { msg: msg });

exports.getSignup = (req, res) => res.render("signup", { msg: msg });

exports.postSignup = (req, res) => {
  const { password, confirmpassword, username, name } = req.body;
  if (password !== confirmpassword) {
    msg = "Passwords are not matching!";
    res.redirect("/auth/signup");
  } else {
    userModel.register({ username, name }, password, (err, user) => {
      if (err) return res.redirect("/auth/signup");
      passport.authenticate("local")(req, res, () => {
        msg = "";
        req.flash("info", "Congrats! You are signed in");
        res.redirect("/");
      });
    });
  }
};

exports.postLogin = (req, res) => {
  const user = new userModel({ username: req.body.username, password: req.body.password });
  req.login(user, err => {
    if (err) {
      msg = "Wrong password!";
      res.redirect("/auth/login");
    } else {
      passport.authenticate("local")(req, res, () => {
        req.flash("info", "Successfully logged in");
        res.redirect("/");
      });
    }
  });
};

exports.getLogout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.redirect("/");
    }
    res.redirect("/");
  });
};
