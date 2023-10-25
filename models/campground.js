const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// This middleware will run once we remove a campground, after we remove
CampgroundSchema.post('findOneAndDelete', async function (deletedCampground) {
    // We have access the removed thing here by passing in, "deletedCampground"
    console.log("Removed Campground: ", deletedCampground);
    if (deletedCampground) {
        await Review.deleteMany({
            _id: {
                $in: deletedCampground.reviews
            }
        });
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);