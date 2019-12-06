var express  = require('express');
var router   = express.Router();
var mongoose = require('mongoose');
var passport = require('../config/passport.js');

// Home
router.get("/", function(req, res){
  res.render("home/welcome");
});
router.get("/about", function(req, res){
  res.render("home/about");
});

// Login
router.get("/login", function (req,res) {
  res.render('login/login', {
    email:req.flash("email")[0],
    loginError:req.flash('loginError'),
    loginMessage:req.flash('loginMessage')
  });
});

// Post Login
router.post('/login', passport.authenticate('local-login', {
  successRedirect : '/posts',
  failureRedirect : '/login',
  failureFlash : true
}));

// Get logout
router.get('/logout', function(req, res) {
  req.logout();
  req.flash("postsMessage", "Good-bye, have a nice day!");
  res.redirect('/');
});

module.exports = router;
