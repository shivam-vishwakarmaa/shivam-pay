const mongoose = require('mongoose');
const { string } = require('zod');

mongoose.connect("mongodb+srv://shivamvishwa844:Shivam$844@cluster0.4kxibsg.mongodb.net/");

const userSchema = mongoose.Schema({
    name : String,
    username : String,
    password : String,
    bankbalance: {
        type: Number,
        required: true,
        default: 1000
    },
    loangiven : String,
    loantaken : String,
})

const User = mongoose.model("User", userSchema);

module.exports = {
    User
}