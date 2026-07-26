const express = require("express");
const router = express.Router();
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");

const SECRET_KEY = process.env.JWT_SECRET || "yshivam";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3).max(300),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address")
});

const loginSchema = z.object({
  username: z.string().min(3).max(300),
  password: z.string().min(3).max(30),
});

// Register — new users start with ₹0 balance
router.post("/register/enter", async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message).join(", ");
    return res.status(400).json({ message: errors || "Please fill all required fields correctly." });
  }

  const { name, username, password, email } = result.data;

  try {
    const userEx = await User.findOne({ username });
    if (userEx) {
      return res.status(400).json({ message: "Username already taken. Try another." });
    }

    const emailEx = await User.findOne({ email });
    if (emailEx) {
      return res.status(400).json({ message: "This email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      upiPin: "1234",
      bankbalance: 0
    });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY);
    
    res.status(200).json({
      message: "Account created successfully!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bankbalance: user.bankbalance
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Registration error: " + err.message });
  }
});

// Login
router.put("/login/enter", async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid credentials" });
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

    const token = jwt.sign({ userId: user._id }, SECRET_KEY);

    res.status(200).json({
      message: "Welcome back!",
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bankbalance: user.bankbalance
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failure: " + err.message });
  }
});

module.exports = router;
