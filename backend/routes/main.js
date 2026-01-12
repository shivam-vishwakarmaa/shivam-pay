const express = require("express");
const router = express.Router();

const loginRouter = require("./login.js"); 
router.use("/login",loginRouter);

const registerRouter = require("./register.js"); 
router.use("/register",registerRouter);

const all = require("./allusers.js");
router.use("/all", all) ;

const transictoinpage = require("./trasiction.js");
router.use("/transictionpage",transictoinpage) ;

module.exports = router;