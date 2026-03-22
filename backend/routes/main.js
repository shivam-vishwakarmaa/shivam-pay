const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middlewares/jwt.js");
const { User } = require("../db");

const loginRouter = require("./login.js"); 
router.use("/login", loginRouter);

const registerRouter = require("./register.js"); 
router.use("/register", registerRouter);

const allUsersRouter = require("./allusers.js");
router.use("/all", allUsersRouter);

const transictionRouter = require("./trasiction.js");
router.use("/trasiction", transictionRouter);

// Add balance route
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