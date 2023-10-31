const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

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
        // Assign user to req.user via password, once they registered
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
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
router.post('/login',
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals   
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local',
        { failureFlash: true, failureRedirect: '/login' }),
    // Now we can use res.locals.returnTo to redirect the user after login
    (req, res) => {
        req.flash('success', 'Welcome back!');
        // update this line to use res.locals.returnTo now
        const redirectUrl = res.locals.returnTo || '/campgrounds';
        // Delete operator removes a property from an object
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    })

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});

module.exports = router;