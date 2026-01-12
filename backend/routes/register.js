const express = require("express");
const { z } = require("zod");
const { User } = require("../db");
const bcrypt = require("bcrypt");

const userSchema = z.object({
  name: z.string().min(3).max(10),
  username: z.string().min(3).max(15),
  password: z.string().min(3).max(6),
});

const registerRouter = express.Router();

registerRouter.post("/enter", async(req, res) => {
  const result = userSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid details",
    });
  }
  const { name, username, password } = result.data;

  const isPresent = await User.findOne({ username });

  if(isPresent){
    return res.status(400).json({
      message: "user already exists !",
    });
  } 

  const hashpasssword = await bcrypt.hash( password , 10);

  await User.create({
    name : name,
    username : username,
    password : hashpasssword,
    bankbalence : 0,
    loangiven : 0,
    loantaken : 0
  })


  res.status(200).json({
    message: "You have created your account",
    user: { name, username, hashpasssword },
  });
});

module.exports = registerRouter;
