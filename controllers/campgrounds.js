const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const geometry = geoData.body.features[0].geometry;
    // This is intermediate schema not a mongo one
    const campground = new Campground(req.body.campground);
    campground.geometry = geometry;
    // Map them into an object
    campground.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
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
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
            }
        })
        .populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
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

// UPDATE/EDIT Campground
module.exports.updateCampground = async (req, res) => {
    const campgroundId = req.params.id;
    const updatedCampgroundContent = req.body.campground;
    const updatedCampground = await Campground.findByIdAndUpdate(campgroundId, { ...updatedCampgroundContent });
    const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }))
    updatedCampground.images.push(...imgs);
    await updatedCampground.save();
    // Handle images to be deleted
    const deleteImages = req.body.deleteImages;
    if (deleteImages) {
        // Remove from the cloudinary
        for (let filename of deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({ $pull: { images: { filename: { $in: deleteImages } } } });
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${updatedCampground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}