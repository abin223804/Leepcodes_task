import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {User} from "../models/index.js";
import {authenticate, authorize} from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/superadmin-exists", async (req, res) => {
    const superadmin = await User.findOne({where: {role: "superadmin"}});
    res.json({exists: !!superadmin});
});

router.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const user = await User.findOne({where: {username}});
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({message: "Invalid credentials"});
    }

    const token = jwt.sign({id: user.id, role: user.role}, process.env.JWT_SECRET, {expiresIn: "1d"});

    res.json({token});
});

router.post("/register-superadmin", async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }

    const existingUser = await User.findOne({where: {username}});
    if (existingUser) {
        return res.status(409).json({message: "Username already exists"});
    }

    const existingSuperadmin = await User.findOne({where: {role: "superadmin"}});
    if (existingSuperadmin) {
        return res.status(403).json({message: "Superadmin already exists"});
    }

    const user = await User.create({username, password, role: "superadmin"});
    res.status(201).json({message: "Superadmin registered successfully"});
});

router.post("/createUser", authenticate, authorize("superadmin"), async (req, res) => {
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

router.get("/users", authenticate, authorize("superadmin"), async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "username", "role"],
            where: {role: ["admin", "user"]},
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Failed to fetch users"});
    }
});

router.delete("/users/:id", authenticate, authorize("superadmin"), async (req, res) => {
    const {id} = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({message: "User not found"});
        await user.destroy();
        res.json({message: "User deleted successfully"});
    } catch (err) {
        res.status(500).json({message: "Server error"});
    }
});

export default router;
