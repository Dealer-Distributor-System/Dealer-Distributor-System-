// controllers/authController.js
// Handles the logic for register and login.
// Controllers receive the request, talk to the database,
// and send back a response. Routes just call these functions.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

// ─────────────────────────────────────────────────────────────
// REGISTER
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ── 1. Validate input fields ───────────────────────────
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, password, role",
      });
    }

    // ── 2. Validate email format ───────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // ── 3. Validate role ───────────────────────────────────
    const allowedRoles = ["dealer", "admin", "traveller"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be one of: dealer, admin, traveller",
      });
    }

    // ── 4. Check if email already exists ──────────────────
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // ── 5. Hash the password ───────────────────────────────
    // bcrypt saltRounds = 10 means the hashing runs 2^10 = 1024 times
    // Higher = more secure but slower. 10 is a safe default.
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ── 6. Insert user into database ───────────────────────
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role, true]
    );

    if (role === 'dealer') {
      const dealerCode = `DLR-${Date.now()}`;
      await pool.query(
        "INSERT INTO dealers (user_id, dealer_code, business_name) VALUES (?, ?, ?)",
        [result.insertId, dealerCode, `${name}'s Business`]
      );
    }
    if (role === 'traveller') {
      await pool.query(
        "INSERT INTO travellers (user_id) VALUES (?)",
        [result.insertId]
      );
    }

    // ── 7. Send success response ───────────────────────────
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: result.insertId,
        name,
        email,
        role,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── 1. Validate input fields ───────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // ── 2. Find user by email ──────────────────────────────
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // ── 3. Check if account is active ─────────────────────
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Your account is not activated yet. Please contact admin.",
      });
    }

    // ── 4. Compare password with stored hash ───────────────
    // bcrypt.compare hashes the plain text and checks against stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ── 5. Generate JWT token ──────────────────────────────
    // The token payload carries user id and role (no sensitive data)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // ── 6. Send success response with token ───────────────
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET PROFILE  (protected route — requires valid JWT)
// GET /api/auth/profile
// ─────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    // req.user is set by the verifyToken middleware
    const [users] = await pool.query(
      "SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error("Get profile error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PROFILE  (protected route — requires valid JWT)
// PUT /api/auth/profile
// ─────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    // Validate name if provided
    if (name === "") {
       return res.status(400).json({ success: false, message: "Name cannot be empty" });
    }

    // Update query
    await pool.query(
      "UPDATE users SET name = COALESCE(?, name), phone = ?, updated_at = NOW() WHERE id = ?",
      [name || null, phone || null, userId]
    );

    // Fetch updated user
    const [users] = await pool.query(
      "SELECT id, name, email, role, phone, is_active, updated_at FROM users WHERE id = ?",
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: users[0],
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during profile update",
    });
  }
};

module.exports = { register, login, getProfile, updateProfile };
