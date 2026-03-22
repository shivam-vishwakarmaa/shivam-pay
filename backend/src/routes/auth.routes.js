const express = require("express");
const router = express.Router();
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");

const SECRET_KEY = "shivam";

// Validation Schemas
const registerSchema = z.object({
  name: z.string(),
  username: z.string().min(3).max(300),
  password: z.string().min(3).max(30),
});

const loginSchema = z.object({
  username: z.string().min(3).max(300),
  password: z.string().min(3).max(30),
});

// Register
router.post("/register/enter", async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid values try again " });
  }

  const { name, username, password } = result.data;

  // Check unique
  const userEx = await User.findOne({ username });
  if (userEx) {
    return res.status(400).json({ message: "email / username taken " });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await User.create({
    name,
    username,
    password: hashedPassword,
  });

  const token = jwt.sign({ userId: user._id }, SECRET_KEY);
  
  res.status(200).json({
    message: "account created successfully",
    token,
    user
  });
});

// Login
router.put("/login/enter", async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid details" });
  }

  const { username, password } = result.data;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: "Account does not exist" });
  }

  const isVerified = await bcrypt.compare(password, user.password);
  if (!isVerified) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, SECRET_KEY);

  res.status(200).json({
    message: "Welcome back",
    token: token
  });
});

module.exports = router;
