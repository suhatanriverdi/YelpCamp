const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
});

// To be able to get virtual methods after calling JSON.stringify(), we enable:
const opts = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
};

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    // Mongoose supports alot of geo-json functionalities
    // like certain radius etc, we will use those operations later on
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);


// Adding properties for MAPBOX popup
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href='/campgrounds/${this._id}'>${this.title}</a></strong><p>${this.description.substring(0, 30)}...</p>`;
});

// This is a QUERY Middleware, there is also document middleware
// This middleware will run once we remove a campground, after we remove
CampgroundSchema.post('findOneAndDelete', async function (deletedCampground) {
    // We have access the removed thing here by passing in, "deletedCampground"
    // console.log("Removed Campground: ", deletedCampground);
    if (deletedCampground) {
        await Review.deleteMany({
            _id: {
                $in: deletedCampground.reviews
            }
        });
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);