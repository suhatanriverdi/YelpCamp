const express = require('express');
/*  '{ mergeParams: true }' this preserves the for example "req.params"
That comes from the Parent router, here we need to use the 
"const campgroundId = req.params.id;"
in the POST middleware, so we need to access the "req.params"
if we didn't use this parameter "{ mergeParams: true }" here,
we were to get TypeError because "req.params" is null.
So whenever we come from the parent, if we want to 
Preserve the "req.params" values from the parent router.

If the parent and the child have conflicting param names, 
the child’s value take precedence.
*/
const router = express.Router({ mergeParams: true });

// Models
const Campground = require('../models/campground');
const Review = require('../models/review');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

// JOI Middleware & Scheme
const { reviewSchema } = require('../schemas');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
        // the statements after throw won't be executed!
    }
    next();
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campgroundId = req.params.id;
    const campground = await Campground.findById(campgroundId);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review!');
    res.redirect(`/campgrounds/${campgroundId}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id: campgroundId, reviewId } = req.params;
    /*
        '$pull' operator removes from an existing array all instances of a value/values
        that match specified condition. Here we remove the specific review.
    */
    await Campground.findByIdAndUpdate(campgroundId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${campgroundId}`);
}))

module.exports = router;