// routes/productRoutes.js
// Defines all URL endpoints for the product module.
// Each route is protected by verifyToken.
// Create / Update / Delete are further restricted to admin role only.

const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
  bulkUploadProducts,
} = require("../controllers/productController");

const verifyToken     = require("../middleware/verifyToken");
const authorizeRoles  = require("../middleware/authorizeRoles");
const upload          = require("../middleware/upload");

// ── All routes below require a valid JWT ─────────────────────
// verifyToken checks the Authorization: Bearer <token> header

// GET  /api/products       → anyone can view
router.get("/",     getProducts);

// GET  /api/products/:id   → anyone can view
router.get("/:id",  getProduct);

// POST /api/products       → admin only
router.post("/",    verifyToken, authorizeRoles("admin"), addProduct);

// PUT  /api/products/:id   → admin only
router.put("/:id",  verifyToken, authorizeRoles("admin"), editProduct);

// DELETE /api/products/:id → admin only
router.delete("/:id", verifyToken, authorizeRoles("admin"), removeProduct);

// POST /api/products/bulk-upload → admin only
router.post("/bulk-upload", verifyToken, authorizeRoles("admin"), upload.single("file"), bulkUploadProducts);

module.exports = router;
