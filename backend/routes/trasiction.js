const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");
const { User } = require("../db");
const authMiddleware = require("../Middlewares/jwt");

Router.post("/payment", async (req, res) => {
  const session = await mongoose.startSession();
  const { senderId, receiverId, amount } = req.body;

  if (!senderId || !receiverId || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    session.startTransaction();

    const senderResult = await User.updateOne(
      { _id: senderId, bankbalance: { $gte: amount } },
      { $inc: { bankbalance: -amount } },
      { session }
    );

    if (senderResult.modifiedCount !== 1) {
      throw new Error("Insufficient balance");
    }

    const receiverResult = await User.updateOne(
      { _id: receiverId },
      { $inc: { bankbalance: amount } },
      { session }
    );

    if (receiverResult.modifiedCount !== 1) {
      throw new Error("Receiver not found");
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Payment successful"
    });

  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: err.message
    });
  } finally {
    session.endSession();
  }
});

module.exports = Router;
