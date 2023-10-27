const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true
    }
});

/* This is going to add on to our schema
    A username, a passport, and it's gonna make sure those
    fields are unique, they are not duplicated, it will also
    give some additional methods we can use
*/
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);