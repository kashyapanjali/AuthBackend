// routes/userRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

function isValidEmail(email) {
	//email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function isValidPassword(password) {
	//password validation
	const passwordRegex =
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
	return passwordRegex.test(password);
}

// Register Route
router.post("/register", async (req, res) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}
		if (!isValidEmail(email)) {
			return res.status(400).json({ message: "Invalid email format" });
		}
		if (!isValidPassword(password)) {
			return res.status(400).json({
				message:
					"Password must be at least 6 characters with a uppercase letter, a lowercase letter, a number, and a special character",
			});
		}
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({ name, email, password: hashedPassword });
		await newUser.save();

		res.status(200).json({ message: "User registered successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});

// Login Route
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}
		if (!isValidEmail(email)) {
			return res.status(400).json({ message: "Invalid email format" });
		}
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}
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
		// Validate email format
		if (!email || !isValidEmail(email)) {
			return res.status(400).json({ message: "Invalid email format" });
		}
		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ message: "User not found" });

		const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "15m",
		});
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
		});

		const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

		await transporter.sendMail({
			from: process.env.EMAIL,
			to: email,
			subject: "Password Reset",
			text: `Click on the following link to reset your password: ${resetLink}`,
			html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
		});
		res.json({ message: "Reset link sent to email" });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});

// Password Reset (Updating Password)
router.post("/reset-password", async (req, res) => {
	try {
		const { token, newPassword } = req.body;
		// Validate password strength
		if (!newPassword || !isValidPassword(newPassword)) {
			return res.status(400).json({
				message:
					"Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character.",
			});
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

		res.json({ message: "Password updated successfully" });
	} catch (error) {
		res.status(400).json({ message: "Invalid or expired token" });
	}
});

//to verify the token
router.get("/users/profile", authMiddleware, async (req, res) => {
	const user = await User.findById(req.user.id).select("-password");
	res.json(user);
});

// Get Username
router.get("/getusername", authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		res.json({ username: user.name });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});

// Get User Email
router.get("/getuseremail", authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		res.json({ email: user.email });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
