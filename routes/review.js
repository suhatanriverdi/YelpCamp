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

// MVC Controllers
const reviews = require('../controllers/reviews');

// Models
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;