module.exports.isLoggedIn = (req, res, next) => {
    // serialize-deserialize thing will work here...
    // Comes from session thanks to password package
    // console.log("req.user: ", req.user);
    if (!req.isAuthenticated()) {
        // To print routes
        // console.log("Paths: ", req.path, req.originalUrl);
        // We store req.originalUrl to redirect user back to where they were left off
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}