const User = require('../models/user');

module.exports.registerUser = async (req, res) => {
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
}

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    // update this line to use res.locals.returnTo now
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    // Delete operator removes a property from an object
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}