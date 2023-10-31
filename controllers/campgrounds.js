const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) {
    //     throw new ExpressError('Invalid Campground Data', 400);
    // }
    // This is intermediate schema not a mongo one
    const campground = new Campground(req.body.campground);
    // Associate the campground with the user who created it." req.user._id" is added thanks to password
    campground.author = req.user._id;
    await campground.save();
    // Creates flash message in our session
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id)
        /* 
            Since we didn't store the parent Campground id in each review,
            We can access the "author" property through the reviews under a campground.
            To do that, we need to populated nested arrays.
            Campground -> Reviews -> ["ObjectId - One Review"] -> ["ObjectId - Author"] -> Username
            Campground:
                reviews: [ ObjectId("..."), ObjectId("...") ]
        */
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
            }
        })
        .populate('author');
        // console.log("campground populated: ", campground.reviews);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
        /* We should use return here because code continues running
            Even if we don't return, we cannot do anything with "res." anymore
            instead, we can do other stuff. We may have an error if we did not.
        */
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEdit = async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground });
}

module.exports.updatedCampground = async (req, res) => {
    const campgroundId = req.params.id;
    const updatedCampgroundContent = req.body.campground;
    const camp = await Campground.findByIdAndUpdate(campgroundId, { ...updatedCampgroundContent });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}