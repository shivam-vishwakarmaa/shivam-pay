const express = require("express");
const router = express.Router();
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const authMiddleware = require("../middlewares/auth.middleware");

const getSecretKey = () => process.env.JWT_SECRET || "shivampay_super_secret_jwt_key_2026_prod";

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

// 1. Standard Registration (Starts with ₹0 balance, 30-Day Long-Lived Session)
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
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      authProvider: "local",
      upiPin: "1234",
      bankbalance: 0
    });

    // Issue 30-Day JWT session token
    const token = jwt.sign({ userId: user._id }, getSecretKey(), { expiresIn: "30d" });
    
    res.status(200).json({
      message: "Account created successfully!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        authProvider: user.authProvider,
        bankbalance: user.bankbalance
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Registration error: " + err.message });
  }
});

// 2. Standard Login with 30-Day Long-Lived Token
router.put("/login/enter", async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid credentials syntax" });
  }

  const { username, password } = result.data;
  try {
    const cleanUsername = username.toLowerCase().trim();
    let user = await User.findOne({ 
      $or: [{ username: cleanUsername }, { email: cleanUsername }] 
    });

    if (!user) {
      return res.status(400).json({ message: "Account does not exist. Please check your username or register." });
    }

    if (user.authProvider === "google" && !user.password) {
      return res.status(401).json({ message: "This account was created via Google Sign-In. Please click 'Continue with Google' above." });
    }

    const isVerified = await bcrypt.compare(password, user.password);
    if (!isVerified) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Issue 30-Day persistent session token
    const token = jwt.sign({ userId: user._id }, getSecretKey(), { expiresIn: "30d" });

    res.status(200).json({
      message: "Welcome back!",
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        authProvider: user.authProvider,
        bankbalance: user.bankbalance
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failure: " + err.message });
  }
});

// 3. Production Google OAuth / One-Click Sign-In
router.post("/auth/google-login", async (req, res) => {
  const { email, name, avatarUrl, googleId } = req.body;
  if (!email || !name) {
    return res.status(400).json({ message: "Invalid Google identity payload." });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    // If user doesn't exist by email, create them atomically via Google OAuth
    if (!user) {
      // Generate unique username from email prefix
      let baseUsername = cleanEmail.split("@")[0].replace(/[^a-z0-9]/g, "").toLowerCase();
      if (!baseUsername || baseUsername.length < 3) baseUsername = "user" + Math.floor(1000 + Math.random() * 9000);
      let proposedUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: proposedUsername })) {
        proposedUsername = `${baseUsername}${counter++}`;
      }

      const dummyPassword = await bcrypt.hash(`GOOGLE_AUTH_${Date.now()}_${Math.random()}`, 10);
      user = await User.create({
        name,
        username: proposedUsername,
        email: cleanEmail,
        password: dummyPassword,
        authProvider: "google",
        googleId: googleId || "google_user",
        avatarUrl: avatarUrl || "",
        upiPin: "1234",
        bankbalance: 0
      });
    } else if (!user.googleId) {
      // Link existing account with Google Sign-In
      user.authProvider = "google";
      user.googleId = googleId || "google_user";
      if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
    }

    // Issue 30-Day persistent session token
    const token = jwt.sign({ userId: user._id }, getSecretKey(), { expiresIn: "30d" });

    res.status(200).json({
      message: "Successfully authenticated with Google!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        authProvider: user.authProvider,
        avatarUrl: user.avatarUrl,
        bankbalance: user.bankbalance
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Google Sign-In error: " + err.message });
  }
});

// 4. Quick Screen Lock PIN Verification (Fintech Security feature)
router.post("/auth/verify-pin", authMiddleware, async (req, res) => {
  const { pin } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.upiPin && user.upiPin !== pin) {
      return res.status(401).json({ success: false, message: "Incorrect PIN. Please try again." });
    }
    res.json({ success: true, message: "Unlocked successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Check Session Validity & Auto-Restore Profile
router.get("/auth/verify-session", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -upiPin");
    if (!user) return res.status(404).json({ valid: false });
    res.json({ valid: true, user });
  } catch (e) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
