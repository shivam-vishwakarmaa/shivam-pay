const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const User = require("../models/User.model");

// Get all users (excluding sensitive fields)
router.get("/allusers", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password -upiPin"); 
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get current user's balance and account details
router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password -upiPin");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ 
          bankbalance: user.bankbalance,
          name: user.name,
          username: user.username,
          email: user.email,
        });
    } catch (e) {
        res.status(500).json({ message: "Error fetching account details" });
    }
});

module.exports = router;
