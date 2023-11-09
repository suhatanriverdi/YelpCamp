const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async (req, res) => {
    const campgroundId = req.params.id;
    const campground = await Campground.findById(campgroundId);
    const review = new Review(req.body.review);
    // ASsociate the review with the current use
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review!');
    res.redirect(`/campgrounds/${campgroundId}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id: campgroundId, reviewId } = req.params;
    await Campground.findByIdAndUpdate(campgroundId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${campgroundId}`);
}