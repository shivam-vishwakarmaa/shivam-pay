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

// Helper: Secure Email Sender / Zero-Config Dev Log for OTP verification
const sendEmailOtp = async (toEmail, toName, otpCode) => {
  try {
    const nodemailer = require("nodemailer");
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.sendMail({
        from: `"ShivamPay Security" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: "🔒 Your ShivamPay Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 450px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1a1a2e;">
            <h2 style="margin-top:0; color: #1a1a2e;">ShivamPay Verification</h2>
            <p>Hello <b>${toName || "User"}</b>,</p>
            <p>You requested a verification code to reset your password or security PIN. Here is your one-time code:</p>
            <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 6px; padding: 16px 0; margin: 20px 0; color: #171717; font-family: monospace;">
              ${otpCode}
            </div>
            <p style="font-size: 13px; color: #6c757d;">This code will expire in <b>10 minutes</b>. If you did not request this, please ignore this email.</p>
          </div>
        `
      });
      return { sent: true, mode: "SMTP" };
    } else {
      // Zero-config dev/demo fallback so tests and live previews work without locking out user!
      console.log("-----------------------------------------");
      console.log(`[EMAIL DEV MODE] To: ${toEmail} | OTP CODE: ${otpCode}`);
      console.log("-----------------------------------------");
      return { sent: true, mode: "DEV_LOG", demoOtp: otpCode };
    }
  } catch (err) {
    console.error("Nodemailer sending failed, falling back to console log:", err.message);
    console.log(`[EMERGENCY LOG] OTP for ${toEmail} is ${otpCode}`);
    return { sent: true, mode: "DEV_LOG", demoOtp: otpCode };
  }
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

  const googleClientId = (process.env.GOOGLE_CLIENT_ID || "").trim().replace(/^["']|["']$/g, '');
  if (!googleClientId) {
    return res.status(500).json({ message: "Server configuration error: GOOGLE_CLIENT_ID is not set in environment variables." });
  }

  try {
    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: googleClientId,
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
    res.status(401).json({ message: "Google Sign-In authentication failed: " + err.message });
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

// 6. Send OTP via Email (For Forgot Password / Forgot PIN)
router.post("/auth/send-otp", authLimiter, async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, message: "Please provide your username or registered email." });
  }

  try {
    const cleanId = identifier.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ username: cleanId }, { email: cleanId }]
    });

    const genericSuccessMessage = "If an account with that identifier exists, a verification code has been sent to the registered email.";

    if (user && user.email) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otpCode, 10);

      user.resetOtp = hashedOtp;
      user.resetOtpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
      await user.save();

      await sendEmailOtp(user.email, user.name, otpCode);
    }

    res.status(200).json({
      success: true,
      message: genericSuccessMessage
    });
  } catch (err) {
    console.error("Error generating OTP:", err);
    res.status(500).json({ success: false, message: "Server error occurred while preparing your verification code." });
  }
});

// 7. Verify OTP and Reset Account Password
router.post("/auth/verify-otp-reset-password", authLimiter, async (req, res) => {
  const { identifier, otp, newPassword } = req.body;
  if (!identifier || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "Identifier, OTP code, and new password are required." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
  }

  try {
    const cleanId = identifier.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ username: cleanId }, { email: cleanId }]
    });

    if (!user || !user.resetOtp || !user.resetOtpExpire || user.resetOtpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "Verification code has expired or is invalid. Please request a new OTP." });
    }

    const isValid = await bcrypt.compare(otp.trim(), user.resetOtp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Incorrect OTP code. Please verify and try again." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save();

    res.status(200).json({ success: true, message: "Your account password has been reset successfully! You can now log in." });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ success: false, message: "Server error occurred during password reset." });
  }
});

// 8. Verify OTP and Reset Security PIN
router.post("/auth/verify-otp-reset-pin", authLimiter, async (req, res) => {
  const { identifier, otp, newPin } = req.body;
  if (!identifier || !otp || !newPin) {
    return res.status(400).json({ success: false, message: "Identifier, OTP code, and new PIN are required." });
  }

  if (!/^\d{4}$/.test(newPin)) {
    return res.status(400).json({ success: false, message: "Security PIN must be exactly 4 digits." });
  }

  try {
    const cleanId = identifier.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ username: cleanId }, { email: cleanId }]
    });

    if (!user || !user.resetOtp || !user.resetOtpExpire || user.resetOtpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "Verification code has expired or is invalid. Please request a new OTP." });
    }

    const isValid = await bcrypt.compare(otp.trim(), user.resetOtp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Incorrect OTP code. Please verify and try again." });
    }

    user.upiPin = await bcrypt.hash(newPin, 10);
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save();

    res.status(200).json({ success: true, message: "Your 4-digit security PIN has been reset successfully!" });
  } catch (err) {
    console.error("PIN reset error:", err);
    res.status(500).json({ success: false, message: "Server error occurred during security PIN reset." });
  }
});

// 9. Authenticated Change PIN (From Settings Page)
router.post("/auth/change-pin", authMiddleware, pinLimiter, async (req, res) => {
  const { currentPin, newPin } = req.body;
  if (!currentPin || !newPin) {
    return res.status(400).json({ success: false, message: "Current PIN and new PIN are required." });
  }

  if (!/^\d{4}$/.test(newPin)) {
    return res.status(400).json({ success: false, message: "New security PIN must be exactly 4 digits." });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    let isMatch = false;
    if (user.upiPin && user.upiPin.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(currentPin, user.upiPin);
    } else {
      isMatch = (user.upiPin === currentPin);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect current PIN." });
    }

    user.upiPin = await bcrypt.hash(newPin, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Your security PIN has been successfully changed!" });
  } catch (err) {
    console.error("Change PIN error:", err);
    res.status(500).json({ success: false, message: "Server error occurred while updating your PIN." });
  }
});

module.exports = router;
