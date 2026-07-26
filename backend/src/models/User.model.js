const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    username: { type: String, unique: true, required: true },
    email: { type: String, default: "" },
    password: { type: String, required: true },
    upiId: { type: String, unique: true },
    upiPin: { type: String, default: "1234" },
    linkedBank: { type: String, default: "HDFC Bank - **** 8824" },
    bankbalance: {
        type: Number,
        required: true,
        default: 10000
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

