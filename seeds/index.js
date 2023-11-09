const mongoose = require('mongoose');
const Campground = require('../models/campground');
const Review = require('../models/review');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
    console.log('Mongo connection opened ✓');
}
main().catch(err => console.log("Mongo Error happened:", err));

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const price = Math.floor(Math.random() * 20) + 10;
        const randomIndex = Math.floor(Math.random() * 1000);
        const randomCity = cities[randomIndex];
        const camp = new Campground({
            // All belong to "melo": "eagle"
            author: '653bc6d212a993d4c98130e7',
            location: `${randomCity.city}, ${randomCity.state}`,
            title: `${sample(places)} ${sample(descriptors)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dplejuooh/image/upload/v1698999010/YelpCamp/ap0pejkqwncth8ump0ad.jpg',
                    filename: 'YelpCamp/dkwyfm8hdepqlkisqeoq'
                },
                {
                    url: 'https://res.cloudinary.com/dplejuooh/image/upload/v1698803109/YelpCamp/xjxwbeavzkgrlzhuulms.jpg',
                    filename: 'YelpCamp/xjxwbeavzkgrlzhuulms'
                }
            ],
            description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente aperiam veritatis modi commodi nemo inventore facere neque laborum. At expedita tempora, ducimus id non adipisci autem incidunt obcaecati. Explicabo, sed!`,
            price,
            geometry: {
                type: "Point",
                coordinates: [randomCity.longitude, randomCity.latitude]
            }
        });
        await camp.save();
    }

    console.log("campgrounds and review dbs has been removed and re-populated!");
}

seedDB().then(() => {
    mongoose.connection.close();
    console.log("DB connection closed.");
})