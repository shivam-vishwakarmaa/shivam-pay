const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const User = require("../models/User.model");

// Get all users (excluding sensitive password & PIN)
router.get("/allusers", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password -upiPin"); 
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "Error fetching users from database" });
  }
});

// Get current user's balance and UPI account details
router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ 
          bankbalance: user.bankbalance,
          name: user.name,
          username: user.username,
          email: user.email,
          upiId: user.upiId || `${user.username}@shivampay`,
          linkedBank: user.linkedBank || "HDFC Bank - **** 8824"
        });
    } catch (e) {
        res.status(500).json({ message: "Error fetching user balance details" });
    }
});

// Update UPI PIN or linked bank
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { upiPin, linkedBank, email } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (upiPin && upiPin.length >= 4) user.upiPin = upiPin;
    if (linkedBank) user.linkedBank = linkedBank;
    if (email) user.email = email;

    await user.save();
    res.json({ success: true, message: "Profile and banking security details updated!", user: { upiId: user.upiId, linkedBank: user.linkedBank, email: user.email } });
  } catch (e) {
    res.status(500).json({ message: "Profile update failure" });
  }
});

module.exports = router;
