import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {User} from "../models/index.js";

const router = express.Router();

import dotenv from "dotenv";

dotenv.config();

router.post("/createUser", async (req, res) => {
    const {username, password, role} = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({message: "Username, password, and role are required"});
    }

    const existing = await User.findOne({where: {username}});
    if (existing) {
        return res.status(409).json({message: "Username already exists"});
    }

    const user = await User.create({username, password, role});

    res.status(201).json({message: "User registered successfully"});
});

router.post("/loginUser", async (req, res) => {
    const {username, password} = req.body;
    const user = await User.findOne({where: {username}});
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({message: "Invalid credentials"});
    }
    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET);
    res.json({token});
});

export default router;
