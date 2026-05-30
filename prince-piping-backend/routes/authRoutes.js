// routes/authRoutes.js
// Defines the URL endpoints for authentication.
// Each route calls the matching function in authController.js.

const express = require("express");
const router = express.Router();

const { register, login, getProfile, updateProfile } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

// ── Public routes (no token needed) ─────────────────────────

// POST /api/auth/register  → create a new user account
router.post("/register", register);

// POST /api/auth/login     → login and receive a JWT token
router.post("/login", login);

// ── Protected route (token required) ────────────────────────

// GET /api/auth/profile    → get the logged-in user's details
router.get("/profile", verifyToken, getProfile);

// PUT /api/auth/profile    → update the logged-in user's details
router.put("/profile", verifyToken, updateProfile);

module.exports = router;
