const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const Transaction = require("../models/Transaction.model");
const Notification = require("../models/Notification.model");
const authMiddleware = require("../middlewares/auth.middleware");
const { paymentLimiter } = require("../middlewares/rateLimiter.middleware");

// Transfer money to another ShivamPay user (wallet-to-wallet)
router.post("/payment", authMiddleware, paymentLimiter, async (req, res) => {
  const { receiverIdentifier, amount, pin, description } = req.body;
  const senderId = req.user.userId;

  if (!senderId || !receiverIdentifier || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: "Please fill in all payment details correctly." });
  }

  if (!pin) {
    return res.status(400).json({ success: false, message: "Security PIN is required to authorize this transfer." });
  }

  const sender = await User.findById(senderId);
  if (!sender) return res.status(404).json({ success: false, message: "Sender account not found." });

  let isMatch = false;
  if (sender.upiPin && sender.upiPin.startsWith("$2b$")) {
    isMatch = await bcrypt.compare(pin, sender.upiPin);
  } else {
    isMatch = (sender.upiPin === pin);
  }
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Incorrect security PIN. Transfer aborted." });
  }

  let receiver = null;
  if (mongoose.isValidObjectId(receiverIdentifier)) {
    receiver = await User.findById(receiverIdentifier);
  }
  if (!receiver) {
    receiver = await User.findOne({ username: receiverIdentifier });
  }

  if (!receiver) {
    return res.status(404).json({ success: false, message: `User "${receiverIdentifier}" not found on ShivamPay.` });
  }

  if (receiver._id.toString() === senderId) {
    return res.status(400).json({ success: false, message: "You cannot send money to yourself." });
  }

  const transferAmount = Number(amount);

  if (sender.bankbalance < transferAmount) {
    return res.status(400).json({ 
      success: false, 
      message: `Insufficient balance. Your balance is ₹${sender.bankbalance.toFixed(2)} but you're trying to send ₹${transferAmount.toFixed(2)}. Please add money first.` 
    });
  }

  try {
    const updatedSender = await User.findOneAndUpdate(
      { _id: sender._id, bankbalance: { $gte: transferAmount } },
      { $inc: { bankbalance: -transferAmount } },
      { new: true }
    );

    if (!updatedSender) {
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient balance at transaction execution time. Transfer failed." 
      });
    }

    const updatedReceiver = await User.findByIdAndUpdate(
      receiver._id,
      { $inc: { bankbalance: transferAmount } },
      { new: true }
    );

    const refId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txn = await Transaction.create({
      senderId: sender._id,
      senderName: sender.name || sender.username,
      senderUpiId: sender.username,
      receiverId: receiver._id,
      receiverName: receiver.name || receiver.username,
      receiverUpiId: receiver.username,
      amount: transferAmount,
      type: 'TRANSFER',
      category: 'Peer Transfer',
      description: description || `Transfer to ${receiver.name || receiver.username}`,
      status: 'SUCCESS',
      referenceId: refId
    });

    await Notification.create({
      userId: receiver._id,
      title: "Money Received!",
      message: `₹${transferAmount.toFixed(2)} received from ${sender.name || sender.username}. Ref: ${refId}`,
      type: "GENERAL"
    });

    res.json({
      success: true,
      message: "Payment successful!",
      transaction: txn,
      newBalance: updatedSender.bankbalance
    });
  } catch (err) {
    console.error("Payment Error:", err);
    res.status(500).json({ success: false, message: "Transaction failed due to a system error. Please try again." });
  }
});

// Get transaction history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await Transaction.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, transactions, currentUserId: userId });
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ success: false, message: "Could not retrieve transaction history at this time." });
  }
});

module.exports = router;
