const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User.model");
const Transaction = require("../models/Transaction.model");
const Notification = require("../models/Notification.model");
const authMiddleware = require("../middlewares/auth.middleware");

// Safely initialize Razorpay (only if keys are configured)
let razorpay = null;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const isRazorpayConfigured =
  RAZORPAY_KEY_ID &&
  RAZORPAY_KEY_ID !== "rzp_test_YOUR_KEY_ID_HERE" &&
  RAZORPAY_KEY_SECRET &&
  RAZORPAY_KEY_SECRET !== "YOUR_KEY_SECRET_HERE";

if (isRazorpayConfigured) {
  const Razorpay = require("razorpay");
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay Payment Gateway Initialized (Live Mode Active)");
} else {
  console.log(
    "⚠️  Razorpay keys not configured. Add your keys to backend/.env to enable real payments."
  );
}

// ─────────────────────────────────────────────────────────────────
// GET /razorpay/config — Send public key to frontend (safe)
// ─────────────────────────────────────────────────────────────────
router.get("/config", authMiddleware, (req, res) => {
  res.json({
    keyId: isRazorpayConfigured ? RAZORPAY_KEY_ID : null,
    isConfigured: isRazorpayConfigured,
    message: isRazorpayConfigured
      ? "Razorpay is configured and ready."
      : "Razorpay keys not set. Configure backend/.env to enable real payments.",
  });
});

// ─────────────────────────────────────────────────────────────────
// POST /razorpay/create-order — Create a Razorpay payment order
// Amount is in INR (paise). ₹100 = 10000 paise.
// ─────────────────────────────────────────────────────────────────
router.post("/create-order", authMiddleware, async (req, res) => {
  if (!isRazorpayConfigured || !razorpay) {
    return res.status(503).json({
      success: false,
      message:
        "Real payments not configured. Please add your Razorpay API keys to backend/.env to enable this feature.",
    });
  }

  const { amount } = req.body;
  const amountNum = Number(amount);

  if (!amountNum || amountNum < 1) {
    return res.status(400).json({ success: false, message: "Minimum top-up amount is ₹1." });
  }

  if (amountNum > 500000) {
    return res
      .status(400)
      .json({ success: false, message: "Maximum top-up amount is ₹5,00,000 per transaction." });
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amountNum * 100), // Razorpay uses paise
      currency: "INR",
      receipt: `topup_${req.user.userId}_${Date.now()}`,
      notes: {
        userId: req.user.userId,
        purpose: "ShivamPay Wallet Top-Up",
      },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({ success: false, message: "Failed to create payment order: " + err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /razorpay/verify — Verify payment signature (SECURITY CRITICAL)
// HMAC-SHA256 signature verification — tamper-proof payment validation
// ─────────────────────────────────────────────────────────────────
router.post("/verify", authMiddleware, async (req, res) => {
  if (!isRazorpayConfigured) {
    return res.status(503).json({ success: false, message: "Razorpay not configured." });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing payment verification parameters." });
  }

  try {
    // HMAC-SHA256 Signature Verification — prevents fraudulent credits
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.warn(`⚠️ Invalid Razorpay signature attempt by user ${req.user.userId}`);
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature — possible fraud attempt blocked.",
      });
    }

    // Check for duplicate payment (prevent double-credit)
    const existing = await Transaction.findOne({ referenceId: razorpay_payment_id });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "This payment has already been processed." });
    }

    // Credit wallet balance
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const amountInRupees = Number(amount) / 100; // Convert paise back to ₹
    user.bankbalance += amountInRupees;
    await user.save();

    // Log immutable transaction record (only safe metadata — no bank details)
    const refId = razorpay_payment_id;
    await Transaction.create({
      senderId: null,
      senderName: "Razorpay Gateway",
      senderUpiId: "razorpay@gateway",
      receiverId: user._id,
      receiverName: user.name || user.username,
      receiverUpiId: user.upiId || `${user.username}@shivampay`,
      amount: amountInRupees,
      type: "WALLET_TOPUP",
      category: "Wallet Top-Up",
      description: `Real money top-up via Razorpay. Ref: ${refId}`,
      status: "SUCCESS",
      referenceId: refId,
    });

    // In-app notification
    await Notification.create({
      userId: user._id,
      title: "✅ Wallet Top-Up Successful!",
      message: `₹${amountInRupees.toFixed(2)} has been added to your ShivamPay wallet via Razorpay. New balance: ₹${user.bankbalance.toFixed(2)}`,
      type: "GENERAL",
    });

    res.json({
      success: true,
      message: `₹${amountInRupees.toFixed(2)} successfully added to your wallet!`,
      newBalance: user.bankbalance,
    });
  } catch (err) {
    console.error("Razorpay verification error:", err);
    res.status(500).json({ success: false, message: "Payment verification error: " + err.message });
  }
});

module.exports = router;
