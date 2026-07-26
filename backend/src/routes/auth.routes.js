const express = require("express");
const router = express.Router();
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User.model");
const authMiddleware = require("../middlewares/auth.middleware");
const { authLimiter, pinLimiter } = require("../middlewares/rateLimiter.middleware");

const getSecretKey = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set.");
  return process.env.JWT_SECRET;
};

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3).max(300),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  upiPin: z.string().regex(/^\d{4}$/, "Security PIN must be exactly 4 digits")
});

const loginSchema = z.object({
  username: z.string().min(3).max(300),
  password: z.string().min(3).max(30),
});

// 1. Standard Registration
router.post("/register/enter", authLimiter, async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message).join(", ");
    return res.status(400).json({ message: errors || "Please fill all required fields correctly." });
  }

  const { name, username, password, email, upiPin } = result.data;

  try {
    const userEx = await User.findOne({ username: username.toLowerCase().trim() });
    if (userEx) {
      return res.status(400).json({ message: "Username already taken. Try another." });
    }

    const emailEx = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailEx) {
      return res.status(400).json({ message: "This email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(upiPin, 10);
    
    const user = await User.create({
      name,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      authProvider: "local",
      upiPin: hashedPin,
      bankbalance: 0
    });

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
    console.error("Registration server error:", err);
    res.status(500).json({ message: "An unexpected error occurred during account registration." });
  }
});

// 2. Standard Login
router.put("/login/enter", authLimiter, async (req, res) => {
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
    console.error("Login server error:", err);
    res.status(500).json({ message: "An error occurred while signing you in." });
  }
});

// 3. Real Google OAuth ID Token Verification
router.post("/auth/google-login", authLimiter, async (req, res) => {
  const { idToken, upiPin } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: "Google ID token is missing." });
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: "Server configuration error: GOOGLE_CLIENT_ID is not set in environment variables." });
  }

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Invalid Google token payload." });
    }

    const cleanEmail = payload.email.toLowerCase().trim();
    const name = payload.name || cleanEmail.split("@")[0];
    const avatarUrl = payload.picture || "";
    const googleId = payload.sub;

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      if (!upiPin || !/^\d{4}$/.test(upiPin)) {
        return res.status(400).json({ 
          requirePin: true, 
          message: "New accounts require setting a 4-digit security PIN to proceed." 
        });
      }

      let baseUsername = cleanEmail.split("@")[0].replace(/[^a-z0-9]/g, "").toLowerCase();
      if (!baseUsername || baseUsername.length < 3) baseUsername = "user" + Math.floor(1000 + Math.random() * 9000);
      let proposedUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: proposedUsername })) {
        proposedUsername = `${baseUsername}${counter++}`;
      }

      const dummyPassword = await bcrypt.hash(`GOOGLE_AUTH_${Date.now()}_${Math.random()}`, 10);
      const hashedPin = await bcrypt.hash(upiPin, 10);

      user = await User.create({
        name,
        username: proposedUsername,
        email: cleanEmail,
        password: dummyPassword,
        authProvider: "google",
        googleId,
        avatarUrl,
        upiPin: hashedPin,
        bankbalance: 0
      });
    } else if (!user.googleId) {
      user.authProvider = "google";
      user.googleId = googleId;
      if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
    }

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
    console.error("Google SSO verification failure:", err);
    res.status(401).json({ message: "Google Sign-In authentication failed." });
  }
});

// 4. Screen Lock PIN Verification
router.post("/auth/verify-pin", authMiddleware, pinLimiter, async (req, res) => {
  const { pin } = req.body;
  if (!pin) {
    return res.status(400).json({ success: false, message: "PIN is required." });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let isMatch = false;
    if (user.upiPin && user.upiPin.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(pin, user.upiPin);
    } else {
      isMatch = (user.upiPin === pin);
      if (isMatch) {
        user.upiPin = await bcrypt.hash(pin, 10);
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect PIN. Please try again." });
    }
    res.json({ success: true, message: "Unlocked successfully" });
  } catch (err) {
    console.error("PIN verification error:", err);
    res.status(500).json({ success: false, message: "Server error occurred during PIN verification." });
  }
});

// 5. Check Session Validity
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
