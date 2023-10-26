const express = require('express');
const router = express.Router();

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
    res.redirect(`/campgrounds/${campgroundId}`);
}));

module.exports = router;