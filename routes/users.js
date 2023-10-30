const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        // This password package handles saving the user for us
        // It automatically creates a user with hashed password
        // as well as username and email
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
    } catch (err) {
        req.flash('error', err.message);

        // BUNU DENE EKSTRA APP YAZ DENE
        res.redirect('/register');
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

/* passport library gives us a middleware we can use for auth */
router.post('/login', passport.authenticate('local',
    { failureFlash: true, failureRedirect: '/login' }),
    (req, res) => {
        req.flash('success', 'Welcome back!');
        res.redirect('/campgrounds');
})

module.exports = router;