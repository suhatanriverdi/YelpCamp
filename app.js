if (process.env.NODE_ENV !== "production") {
    console.log("DEVELOPMENT MODE ENABLED", process.env.NODE_ENV);
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

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

const MongoDbUrl = process.env.MONGODB_URL;

async function main() {
    await mongoose.connect(MongoDbUrl);
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
app.use(express.static(path.join(__dirname, 'public')));
// Removes "$gt:" like queries for security purposes
app.use(mongoSanitize());

const secret = process.env.SECRET || 'developmentsecret';

const store = MongoStore.create({
    mongoUrl: MongoDbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on('error', function (e) {
    console.log('Store Error! ', e);
})

// Config objects & setting up session
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    // We can have fancy options for our cookie like expiration date
    cookie: {
        // To Aviod Cross Side Scripting CSS, extra security
        httpOnly: true,
        // secure: true, // cookies can only be configured only over https
        // Date.now() is in miliseconds
        // One week is "1000 * 60 * 60 * 24 * 7" milliseconds
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// This should be before "passport.session()"
app.use(session(sessionConfig));
app.use(flash()); // Flash messages

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dplejuooh/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

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
    // Views will have access to user info everywhere
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'melo@gmail.com', username: 'melo' });
    const newUser = await User.register(user, 'eagle');
    res.send(newUser);
})

// ROUTES
app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
    res.render('home');
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