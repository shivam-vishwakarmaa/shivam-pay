const express = require("express");
const loginRouter = express.Router();
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../db"); 

const SECRET_KEY = "shivam";

const userSchema = z.object({
  username: z.string().min(3).max(15),
  password: z.string().min(3).max(6),
});

loginRouter.put("/enter", async (req, res) => {
  
  const result = userSchema.safeParse(req.body);

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

  const token = jwt.sign(
    { userId: user._id },
    SECRET_KEY,
  );

  res.status(200).json({
    message: "Welcome back",
    token : token
  });
});

module.exports = loginRouter;
