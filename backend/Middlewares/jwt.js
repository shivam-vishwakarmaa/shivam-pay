const jwt = require("jsonwebtoken");
const skey = "shivam";

function authMiddlerware(req, res, next) {
  const autheader = req.headers.authorization;
  if (!autheader) {
    return res.status(401).json({
      message: "token is missing!",
    });
  }
  const token = autheader.startsWith("Bearer ")
    ? autheader.split(" ")[1]
    : autheader;
  try {
    const decoded = jwt.verify(token, skey);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authMiddlerware;
