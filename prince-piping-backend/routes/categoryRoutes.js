// routes/categoryRoutes.js
// Maps URL endpoints to controller functions for categories.
// All routes require a valid JWT token.
// Create / Update / Delete are restricted to admin role only.

const express = require("express");
const router = express.Router();

const {
  getCategories,
  getCategory,
  addCategory,
  editCategory,
  removeCategory,
} = require("../controllers/categoryController");

const verifyToken    = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

// ── GET  /api/categories      → all logged-in users ──────────
router.get("/",     verifyToken, getCategories);

// ── GET  /api/categories/:id  → all logged-in users ──────────
router.get("/:id",  verifyToken, getCategory);

// ── POST /api/categories      → admin only ───────────────────
router.post("/",    verifyToken, authorizeRoles("admin"), addCategory);

// ── PUT  /api/categories/:id  → admin only ───────────────────
router.put("/:id",  verifyToken, authorizeRoles("admin"), editCategory);

// ── DELETE /api/categories/:id → admin only ──────────────────
router.delete("/:id", verifyToken, authorizeRoles("admin"), removeCategory);

module.exports = router;
