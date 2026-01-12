const express = require("express");
const Router = express.Router();
const { z } = require("zod");
const authMiddlerware = require("../Middlewares/jwt.js");
const jwt = require("jsonwebtoken");
const skey = "shivam";

const userSchema = z.object({
    username : z.string().min(3,"To short usename or invalid!").max(15),
    password : z.string().min(3).max(6)
})

Router.put("/enter", authMiddlerware, (req,res)=>{
    const result = userSchema.safeParse(req.body);
    if(!result.success){
        res.send("Invalid details");
    }
    const { username } = result.data ;
    const user = { id:1, username} ; 

    const token = jwt.sign(
        user,
        skey
    )

    res.status(200).json({
        message : "user information changed succesfully ",
        data : result.data ,
        token : token
    });
})

module.exports = Router ;