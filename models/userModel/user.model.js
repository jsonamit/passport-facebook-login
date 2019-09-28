const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    facebook: {
        id : String,
        name : String,
        email : String,
        token : String
    }
});

const users=mongoose.model('users',userSchema);

module.exports = users;
