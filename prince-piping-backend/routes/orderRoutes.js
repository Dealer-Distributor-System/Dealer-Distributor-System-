// routes/orderRoutes.js
// Maps URL endpoints to controller functions for orders.
//
// Access summary:
//   POST   /api/orders             → dealer only (place order from cart)
//   GET    /api/orders             → dealer (own orders) + admin (all orders)
//   GET    /api/orders/:id         → dealer (own) + admin (any)
//   PATCH  /api/orders/:id/status  → admin only (approve/reject/cancel)

const express = require("express");
const router  = express.Router();

const {
  placeOrder,
  getOrders,
  getOrder,
  changeOrderStatus,
  submitOrderFeedback,
} = require("../controllers/orderController");

const verifyToken    = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

// POST   /api/orders             → dealer places a new order from cart
router.post(
  "/",
  verifyToken,
  authorizeRoles("dealer"),
  placeOrder
);

// GET    /api/orders             → dealer sees own orders, admin sees all
router.get(
  "/",
  verifyToken,
  authorizeRoles("dealer", "admin"),
  getOrders
);

// GET    /api/orders/:id         → order detail with all items
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("dealer", "admin"),
  getOrder
);

router.post(
  "/:id/feedback",
  verifyToken,
  authorizeRoles("dealer"),
  submitOrderFeedback
);

// PATCH  /api/orders/:id/status  → admin updates status (approve/reject etc.)
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles("admin"),
  changeOrderStatus
);

module.exports = router;
