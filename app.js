const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

// Campground Routes
const campgroundsRoute = require('./routes/campgrounds');
// Review Routes
const reviewsRoute = require('./routes/review');

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
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ROUTES
app.use('/campgrounds', campgroundsRoute);
app.use('/campgrounds/:id/reviews', reviewsRoute);

app.get('/', (req, res) => {
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