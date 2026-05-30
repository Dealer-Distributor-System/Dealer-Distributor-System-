// middleware/verifyToken.js
// This middleware runs BEFORE a protected route handler.
// It checks the Authorization header for a valid JWT token.
// If valid → attaches user info to req.user and calls next().
// If invalid → immediately returns 401 Unauthorized.

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // ── 1. Read token from Authorization header ────────────
  // The frontend must send: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  // Extract the token part after "Bearer "
  const token = authHeader.split(" ")[1];

  // ── 2. Verify the token ────────────────────────────────
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded will contain: { id, role, iat, exp }
    req.user = decoded; // attach to request so controllers can use it
    next();             // move on to the next middleware or route handler
  } catch (error) {
    // Token is expired or tampered
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};

module.exports = verifyToken;
