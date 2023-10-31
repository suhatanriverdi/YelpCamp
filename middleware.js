const ExpressError = require('./utils/ExpressError');
const { campgroundSchema } = require('./schemas');
const Campground = require('./models/campground');

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

module.exports.isAuthor = async (req, res, next) => {
    const campgroundId = req.params.id;
    const campground = await Campground.findById(campgroundId);
    // If the user is not owner of the currently viewing campground
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', `You don't have permission to do that!`);
        return res.redirect(`/campgrounds/${campground._id}`);
    }
    next();
}

// JOI Middleware
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
        // the statements after throw won't be executed!
    }
    next();
}