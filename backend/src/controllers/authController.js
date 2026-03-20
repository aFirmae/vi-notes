const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateAccessToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "2h" });
};

const generateRefreshToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) => {
	const errors = [];
	if (password.length < 8) errors.push("Password must be at least 8 characters");
	if (!/[A-Z]/.test(password)) errors.push("Must contain at least one uppercase letter");
	if (!/[a-z]/.test(password)) errors.push("Must contain at least one lowercase letter");
	if (!/[0-9]/.test(password)) errors.push("Must contain at least one number");
	return errors;
};

// POST /api/auth/register
const register = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required" });
		}

		// Validation
		const fieldErrors = {};
		if (!isValidEmail(email)) fieldErrors.email = "Invalid email format";
		
		const pwErrors = validatePassword(password);
		if (pwErrors.length > 0) fieldErrors.password = pwErrors[0];

		if (Object.keys(fieldErrors).length > 0) {
			return res.status(400).json({ errors: fieldErrors });
		}

		const existing = await User.findOne({ email: email.toLowerCase() });
		if (existing) {
			return res.status(409).json({ message: "User already exists" });
		}

		const user = await User.create({ email, passwordHash: password });
		const token = generateAccessToken(user._id);
		const refreshToken = generateRefreshToken(user._id);

		res.status(201).json({
			token,
			refreshToken,
			user: user.toJSON(),
		});
	} catch (error) {
		console.error("Register error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

// POST /api/auth/login
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required" });
		}

		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const token = generateAccessToken(user._id);
		const refreshToken = generateRefreshToken(user._id);

		res.json({
			token,
			refreshToken,
			user: user.toJSON(),
		});
	} catch (error) {
		console.error("Login error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(401).json({ message: "Refresh token is required" });
		}

		// Verify refresh token
		jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
			if (err) {
				return res.status(401).json({ message: "Invalid or expired refresh token" });
			}

			// Token is valid, check if user still exists
			const user = await User.findById(decoded.userId);
			if (!user) {
				return res.status(401).json({ message: "User no longer exists" });
			}

			// Generate new tokens
			const newToken = generateAccessToken(user._id);
			const newRefreshToken = generateRefreshToken(user._id);

			res.json({
				token: newToken,
				refreshToken: newRefreshToken,
			});
		});
	} catch (error) {
		console.error("Refresh error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

module.exports = { register, login, refresh };
