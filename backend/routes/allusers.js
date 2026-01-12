const { User } = require("../db");
const express = require("express");
const router = express.Router();
const authMiddlerware = require("../Middlewares/jwt.js");

router.get("/allusers", authMiddlerware, async (req, res) => {
  try {
    const users = await User.find();
    // res.status(200).json(users) ;
    res.send(users);
  } catch (e) {
    res.status(411).json({
      messaage: "somehing happend while fetching fron databse !",
    });
  }
});

module.exports = router;
