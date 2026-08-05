const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User.model");
const Transaction = require("../models/Transaction.model");
const Notification = require("../models/Notification.model");
const authMiddleware = require("../middlewares/auth.middleware");
const { paymentLimiter } = require("../middlewares/rateLimiter.middleware");

// Safely initialize Razorpay (only if keys are configured)
let razorpay = null;
const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || "").trim().replace(/^["']|["']$/g, '');
const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || "").trim().replace(/^["']|["']$/g, '');

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

// GET /razorpay/config — Send public key to frontend
router.get("/config", authMiddleware, (req, res) => {
  res.json({
    keyId: isRazorpayConfigured ? RAZORPAY_KEY_ID : null,
    isConfigured: isRazorpayConfigured,
    message: isRazorpayConfigured
      ? "Razorpay is configured and ready."
      : "Razorpay keys not set. Configure backend/.env to enable real payments.",
  });
});

// POST /razorpay/create-order — Create a Razorpay payment order
router.post("/create-order", authMiddleware, paymentLimiter, async (req, res) => {
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
      receipt: `tp_${req.user.userId.toString().slice(-8)}_${Date.now()}`,
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
    res.status(500).json({ success: false, message: "Failed to initialize payment gateway order." });
  }
});

// POST /razorpay/verify — Verify payment signature and fetch real amount from Razorpay
router.post("/verify", authMiddleware, paymentLimiter, async (req, res) => {
  if (!isRazorpayConfigured || !razorpay) {
    return res.status(503).json({ success: false, message: "Razorpay not configured." });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing payment verification parameters." });
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.warn(`⚠️ Invalid Razorpay signature attempt by user ${req.user.userId}`);
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid cryptographic signature — possible fraud attempt blocked.",
      });
    }

    const existing = await Transaction.findOne({ referenceId: razorpay_payment_id });
    if (existing) {
      return res.status(400).json({ success: false, message: "This payment reference has already been processed." });
    }

    const paymentData = await razorpay.payments.fetch(razorpay_payment_id);
    if (!paymentData || (paymentData.status !== "captured" && paymentData.status !== "authorized")) {
      return res.status(400).json({ success: false, message: "Payment has not been captured or authorized by Razorpay." });
    }

    const verifiedAmountRupees = Number(paymentData.amount) / 100;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $inc: { bankbalance: verifiedAmountRupees } },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User account not found." });

    const refId = razorpay_payment_id;
    await Transaction.create({
      senderId: null,
      senderName: "Razorpay Gateway",
      senderUpiId: "razorpay@gateway",
      receiverId: user._id,
      receiverName: user.name || user.username,
      receiverUpiId: `${user.username}@shivampay`,
      amount: verifiedAmountRupees,
      type: "WALLET_TOPUP",
      category: "Wallet Top-Up",
      description: `Verified top-up via Razorpay Gateway. Ref: ${refId}`,
      status: "SUCCESS",
      referenceId: refId,
    });

    await Notification.create({
      userId: user._id,
      title: "✅ Wallet Top-Up Successful!",
      message: `₹${verifiedAmountRupees.toFixed(2)} has been added to your ShivamPay wallet. New balance: ₹${user.bankbalance.toFixed(2)}`,
      type: "GENERAL",
    });

    res.json({
      success: true,
      message: `₹${verifiedAmountRupees.toFixed(2)} successfully added to your wallet!`,
      newBalance: user.bankbalance,
    });
  } catch (err) {
    console.error("Razorpay verification error:", err);
    res.status(500).json({ success: false, message: "Payment verification error occurred on the server." });
  }
});

module.exports = router;
