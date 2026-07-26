const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    username: { type: String, unique: true, required: true },
    email: { type: String, default: "" },
    password: { type: String, required: true },
    upiPin: { type: String, default: "1234" },
    bankbalance: {
        type: Number,
        required: true,
        default: 0
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
