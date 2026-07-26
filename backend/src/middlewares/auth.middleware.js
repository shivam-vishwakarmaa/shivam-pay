const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const secretKey = process.env.JWT_SECRET || "shivampay_super_secret_jwt_key_2026_prod";
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
