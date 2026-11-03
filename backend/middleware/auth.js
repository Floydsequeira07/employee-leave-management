const jwt = require("jsonwebtoken");

// Verifies the "Authorization: Bearer <token>" header
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Session expired. Please log in again.",
    });
  }
};

// Allows only the given role (e.g. "admin")
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  next();
};

module.exports = { verifyToken, requireRole };