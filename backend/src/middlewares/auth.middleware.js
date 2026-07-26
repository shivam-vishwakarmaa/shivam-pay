const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error("❌ Fatal Security Error: JWT_SECRET is not set in environment variables.");
    return res.status(500).json({ message: "Internal Server Configuration Error." });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication token is missing. Please log in.",
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Session expired or invalid token. Please log in again." });
  }
}

module.exports = authMiddleware;
