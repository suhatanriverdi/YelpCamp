const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

// These are different from passportLocalMongoose package
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// Campground Routes
const campgroundsRoutes = require('./routes/campgrounds');
// Review Routes
const reviewsRoutes = require('./routes/review');
// Register Routes
const userRoutes = require('./routes/users');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
    console.log('Mongo connection opened ✓');
}
main().catch(err => console.log("Mongo Error happened:", err));

const app = express();
const port = 3000;

app.listen(port, () => {
    console.log('Express App is listening on port: ', port, '...');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// Enable "public" folder to serve static files like css, pngs etc
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Config objects & setting up session
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    // We can have fancy options for our cookie like expiration date
    cookie: {
        // To Aviod Cross Side Scripting CSS, extra security
        httpOnly: true,
        // Date.now() is in miliseconds
        // One week is "1000 * 60 * 60 * 24 * 7" milliseconds
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// This should be before "passport.session()"
app.use(session(sessionConfig));
app.use(flash()); // Flash messages

// This is required to initialized the passport package
app.use(passport.initialize());
// We need this for a persistent login session
// This should come after "app.use(session(sessionConfig));"
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// How to store and un-store the user in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash middleware, to give access to "locals.success" in our templates/views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'melo@gmail.com', username: 'melo' });
    // Takes instance of a user model and a passport
    // And this will hash and store it for us
    const newUser = await User.register(user, 'eagle');
    res.send(newUser);
})

// ROUTES
app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
    // req.params -> to access pattern variable inside
    // the Route Path /campgrounds/":id" id here in express

    // req.query -> to access the Query string parameters we pass to URL
    // req.body -> to access POST info
    res.redirect('/campgrounds');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Something went wrong!'
    }
    res.status(statusCode).render('error', { err });
})


/*
redirect redirects the user's browser to another address. 
That means, for example, that if the user goes to 'myadress.com/redirect-me', 
and you redirect him to '/i-was-redirected', he will go to 'myadress.com/i-was-redirected'.

render is used to show a template (for example .ejs) at the current address the browser is at.
*/