const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const Transaction = require("../models/Transaction.model");
const Notification = require("../models/Notification.model");
const authMiddleware = require("../middlewares/auth.middleware");

// Transfer money via UPI ID, Username, or User ID with PIN Verification
router.post("/payment", authMiddleware, async (req, res) => {
  const { receiverIdentifier, amount, pin, category, description } = req.body;
  const senderId = req.user.userId;

  if (!senderId || !receiverIdentifier || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid payment details or negative amount" });
  }

  const sender = await User.findById(senderId);
  if (!sender) return res.status(404).json({ success: false, message: "Sender account not found" });

  // Verify PIN
  if (pin && sender.upiPin && sender.upiPin !== pin) {
    return res.status(400).json({ success: false, message: "Incorrect UPI PIN. Transaction failed." });
  }

  // Find Receiver by UPI ID, Username, or MongoDB ID
  let receiver = null;
  if (mongoose.isValidObjectId(receiverIdentifier)) {
    receiver = await User.findById(receiverIdentifier);
  }
  if (!receiver) {
    receiver = await User.findOne({ $or: [{ upiId: receiverIdentifier }, { username: receiverIdentifier }] });
  }

  if (!receiver) {
    return res.status(404).json({ success: false, message: `Receiver "${receiverIdentifier}" not found on ShivamPay.` });
  }

  if (receiver._id.toString() === senderId) {
    return res.status(400).json({ success: false, message: "You cannot send money to yourself." });
  }

  const transferAmount = Number(amount);

  if (sender.bankbalance < transferAmount) {
    return res.status(400).json({ 
      success: false, 
      message: `Insufficient bank balance ($${sender.bankbalance.toFixed(2)}) for transfer of $${transferAmount.toFixed(2)}` 
    });
  }

  // Execute transfer
  try {
    sender.bankbalance -= transferAmount;
    receiver.bankbalance += transferAmount;
    await sender.save();
    await receiver.save();

    const refId = `UPI-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txn = await Transaction.create({
      senderId: sender._id,
      senderName: sender.name || sender.username,
      senderUpiId: sender.upiId || `${sender.username}@shivampay`,
      receiverId: receiver._id,
      receiverName: receiver.name || receiver.username,
      receiverUpiId: receiver.upiId || `${receiver.username}@shivampay`,
      amount: transferAmount,
      type: 'UPI_SEND',
      category: category || 'Peer Transfer',
      description: description || `Instant UPI transfer to ${receiver.name || receiver.username}`,
      status: 'SUCCESS',
      referenceId: refId
    });

    // Notify Receiver
    await Notification.create({
      userId: receiver._id,
      title: "💵 Money Received via UPI!",
      message: `You received $${transferAmount.toFixed(2)} from ${sender.name || sender.username} (${sender.upiId || 'UPI'}). Ref: ${refId}`,
      type: "UPI_RECEIPT"
    });

    res.json({
      success: true,
      message: "UPI Payment successful!",
      transaction: txn,
      newBalance: sender.bankbalance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Transaction processing error: " + err.message });
  }
});

// Bill Payments Service (Electricity, DTH, Mobile Recharge, Water)
router.post("/bills/pay", authMiddleware, async (req, res) => {
  const { billerName, category, amount, pin, consumerNumber } = req.body;
  const senderId = req.user.userId;

  if (!billerName || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid bill payment parameters" });
  }

  const sender = await User.findById(senderId);
  if (!sender) return res.status(404).json({ success: false, message: "User account not found" });

  if (pin && sender.upiPin && sender.upiPin !== pin) {
    return res.status(400).json({ success: false, message: "Incorrect UPI PIN. Bill payment failed." });
  }

  const billAmount = Number(amount);
  if (sender.bankbalance < billAmount) {
    return res.status(400).json({ success: false, message: `Insufficient bank balance ($${sender.bankbalance}) to pay ${billerName} bill.` });
  }

  try {
    sender.bankbalance -= billAmount;
    await sender.save();

    const refId = `BILL-${Date.now()}-${Math.floor(1000 + Math.random()*9000)}`;
    const txn = await Transaction.create({
      senderId: sender._id,
      senderName: sender.name || sender.username,
      senderUpiId: sender.upiId || 'N/A',
      receiverName: `${billerName} (${consumerNumber || 'Bill'})`,
      receiverUpiId: `${category.toLowerCase()}@billpay`,
      amount: billAmount,
      type: 'BILL_PAY',
      category: category || 'Bill Payment',
      description: `Bill payment for ${billerName} - ${consumerNumber || ''}`,
      status: 'SUCCESS',
      referenceId: refId
    });

    await Notification.create({
      userId: sender._id,
      title: "🧾 Bill Payment Successful",
      message: `Paid $${billAmount.toFixed(2)} to ${billerName}. Ref: ${refId}`,
      type: "GENERAL"
    });

    res.json({ success: true, message: `Successfully paid ${billerName} bill of $${billAmount.toFixed(2)}!`, transaction: txn, newBalance: sender.bankbalance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get comprehensive user transaction log
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await Transaction.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, transactions, currentUserId: userId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
