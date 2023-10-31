const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

// MVC Controllers
const users = require('../controllers/users');

router.get('/register', users.renderRegister)

router.post('/register', catchAsync(users.registerUser))

router.get('/login', users.renderLogin)

/* passport library gives us a middleware we can use for auth */
router.post('/login',
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals   
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local',
        { failureFlash: true, failureRedirect: '/login' }),
    // Now we can use res.locals.returnTo to redirect the user after login
    users.login)

router.get('/logout', users.logout);

module.exports = router;