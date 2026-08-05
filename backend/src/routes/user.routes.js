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

const Loan = require("../models/Loan.model");
const { getCreditLimit } = require("../utils/creditLimit");

// Get trust summary for a specific user
router.get("/users/:username/trust-summary", authMiddleware, async (req, res) => {
    try {
        const username = req.params.username.toLowerCase().trim();
        const user = await User.findOne({ username }).select("trustScore completedLoansAsBorrower onTimeEmiCount missedEmiCount");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const limit = getCreditLimit(user.trustScore || 50);
        const borrowerActiveLoans = await Loan.find({ borrowerId: user._id, status: { $in: ['ACTIVE', 'OVERDUE'] } });
        const currentExposure = borrowerActiveLoans.reduce((sum, l) => sum + l.remainingAmount, 0);
        const availableToBorrow = Math.max(0, limit - currentExposure);

        res.json({
            success: true,
            trustScore: user.trustScore || 50,
            completedLoansAsBorrower: user.completedLoansAsBorrower || 0,
            onTimeEmiCount: user.onTimeEmiCount || 0,
            missedEmiCount: user.missedEmiCount || 0,
            creditLimit: limit,
            currentExposure,
            availableToBorrow
        });
    } catch (e) {
        console.error("Trust summary error:", e);
        res.status(500).json({ success: false, message: "Error fetching trust summary." });
    }
});

module.exports = router;
