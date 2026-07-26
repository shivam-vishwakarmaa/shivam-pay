const express = require("express");
const router = express.Router();
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");

const SECRET_KEY = process.env.JWT_SECRET || "yshivam";

// Validation Schemas
const registerSchema = z.object({
  name: z.string(),
  username: z.string().min(3).max(300),
  password: z.string().min(3).max(30),
  email: z.string().optional()
});

const loginSchema = z.object({
  username: z.string().min(3).max(300),
  password: z.string().min(3).max(30),
});

// Register with default UPI credentials
router.post("/register/enter", async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid registration values. Please verify." });
  }

  const { name, username, password, email } = result.data;

  try {
    const userEx = await User.findOne({ username });
    if (userEx) {
      return res.status(400).json({ message: "Username already taken. Try another." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultUpiId = `${username.toLowerCase()}@shivampay`;
    
    const user = await User.create({
      name,
      username,
      email: email || `${username}@shivampay.tech`,
      password: hashedPassword,
      upiId: defaultUpiId,
      upiPin: "1234",
      linkedBank: "HDFC Bank - **** 8824",
      bankbalance: 10000
    });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY);
    
    res.status(200).json({
      message: "Account created successfully with default UPI ID!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        upiId: user.upiId,
        linkedBank: user.linkedBank,
        bankbalance: user.bankbalance
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Registration error: " + err.message });
  }
});

// Login with automatic backward-compatible UPI ID initialization
router.put("/login/enter", async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid credentials syntax" });
  }

  const { username, password } = result.data;
  try {
    let user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Account does not exist" });
    }

    const isVerified = await bcrypt.compare(password, user.password);
    if (!isVerified) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Auto-migrate legacy accounts with new UPI ID and fields
    let modified = false;
    if (!user.upiId) {
      user.upiId = `${user.username.toLowerCase()}@shivampay`;
      modified = true;
    }
    if (!user.upiPin) {
      user.upiPin = "1234";
      modified = true;
    }
    if (!user.linkedBank) {
      user.linkedBank = "HDFC Bank - **** 8824";
      modified = true;
    }
    if (!user.email) {
      user.email = `${user.username}@shivampay.tech`;
      modified = true;
    }
    if (modified) {
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY);

    res.status(200).json({
      message: "Welcome back to ShivamPay!",
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        upiId: user.upiId,
        linkedBank: user.linkedBank,
        bankbalance: user.bankbalance
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failure: " + err.message });
  }
});

module.exports = router;
