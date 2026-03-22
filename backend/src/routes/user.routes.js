const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const User = require("../models/User.model");

// Get all users
router.get("/allusers", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Don't expose passwords
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "Error fetching users from database" });
  }
});

// Get current user's balance
router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ bankbalance: user.bankbalance });
    } catch (e) {
        res.status(500).json({ message: "Error fetching balance" });
    }
});

module.exports = router;
