// routes/cartRoutes.js
// All cart endpoints — only accessible by dealers.
// verifyToken  → confirms the user is logged in (JWT check)
// authorizeRoles("dealer") → blocks admin and traveller

const express = require("express");
const router = express.Router();

const {
  addToCart,
  viewCart,
  updateItem,
  removeItem,
  clearCart,
  reorderFromOrder,
} = require("../controllers/cartController");

const verifyToken    = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

// Apply both middlewares to ALL cart routes in one line
// Every route below is: JWT required + dealer role only
router.use(verifyToken, authorizeRoles("dealer"));

// POST   /api/cart/add              → add product to cart
router.post("/add", addToCart);

// POST   /api/cart/reorder/:orderId → add order items to cart
router.post("/reorder/:orderId", reorderFromOrder);

// GET    /api/cart                  → view full cart with product details
router.get("/", viewCart);

// PUT    /api/cart/update/:itemId   → change quantity of one item
router.put("/update/:itemId", updateItem);

// DELETE /api/cart/remove/:itemId  → remove one item
router.delete("/remove/:itemId", removeItem);

// DELETE /api/cart/clear           → empty the entire cart
router.delete("/clear", clearCart);

module.exports = router;
