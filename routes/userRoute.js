// routes/userRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const nodemailer = require("nodemailer");

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password)
			return res.status(400).json({ message: "All fields are required" });

		const userExists = await User.findOne({ email });
		if (userExists)
			return res.status(400).json({ message: "User already exists" });

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({ name, email, password: hashedPassword });
		await newUser.save();

		res.status(200).json({ message: "User registered successfully" });
	} catch (error) {
		console.error("Error in /register:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Login Route
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password)
			return res.status(400).json({ message: "All fields are required" });

		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ message: "Invalid credentials" });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid credentials" });

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});
		res.json({
			token,
			user: { id: user._id, name: user.name, email: user.email },
		});
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});

// Password Reset (Token Generation)
router.post("/forgot-password", async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ message: "User not found" });

		const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "15m",
		});
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
		});

		await transporter.sendMail({
			from: process.env.EMAIL,
			to: email,
			subject: "Password Reset",
			text: `Use this token to reset your password: ${resetToken}`,
		});

		res.json({ message: "Reset link sent to email" });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
