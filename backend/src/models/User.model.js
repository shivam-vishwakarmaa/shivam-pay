const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    password: String,
    bankbalance: {
        type: Number,
        required: true,
        default: 1000
    },
});

module.exports = mongoose.model("User", userSchema);
