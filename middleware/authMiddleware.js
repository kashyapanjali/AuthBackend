const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
	const token = req.header("Authorization"); // Get token from request headers
	if (!token)
		return res
			.status(401)
			.json({ message: "Access Denied. No token provided." });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded; // Attach user data to the request
		next();
	} catch (error) {
		res.status(400).json({ message: "Invalid token" });
	}
};

module.exports = authMiddleware;
