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
    console.error("Fetch all users error:", e);
    res.status(500).json({ message: "Error fetching user list from server" });
  }
});

// Get current user's balance and account details
router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password -upiPin");
        if (!user) return res.status(404).json({ message: "User account not found" });
        res.json({ 
          bankbalance: user.bankbalance,
          name: user.name,
          username: user.username,
          email: user.email,
          authProvider: user.authProvider,
          avatarUrl: user.avatarUrl
        });
    } catch (e) {
        console.error("Fetch balance error:", e);
        res.status(500).json({ message: "Error fetching account details from server" });
    }
});

module.exports = router;
