const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, default: "" },
    password: { type: String }, // Can be optional if logged in exclusively via Google OAuth
    authProvider: { type: String, default: "local", enum: ["local", "google"] },
    googleId: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    upiPin: { type: String, required: true }, // Bcrypt-hashed 4-digit security PIN required during onboarding
    bankbalance: {
        type: Number,
        required: true,
        default: 0
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
