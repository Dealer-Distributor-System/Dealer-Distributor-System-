// routes/deliveryRoutes.js
// Maps URL endpoints to controller functions for deliveries.
//
// Access summary:
//   POST /api/deliveries                      → admin only
//   GET  /api/deliveries                      → admin + traveller + dealer
//   GET  /api/deliveries/:id                  → admin + traveller + dealer
//   PUT  /api/deliveries/:id/accept           → traveller only
//   POST /api/deliveries/:id/update-status    → traveller only (assigned one)
//   GET  /api/deliveries/:id/tracking         → admin + traveller + dealer

const express = require("express");
const router  = express.Router();

const {
  createDeliveryHandler,
  getDeliveries,
  getDeliveryDetail,
  acceptDeliveryHandler,
  updateStatusHandler,
  getTrackingHandler,
  assignDeliveryHandler,
  getTrackingByOrderIdHandler,
} = require("../controllers/deliveryController");

const verifyToken    = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

// POST /api/deliveries          → admin creates delivery after payment verified
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  createDeliveryHandler
);

// POST /api/deliveries/assign   → admin assigns delivery to traveller directly
router.post(
  "/assign",
  verifyToken,
  authorizeRoles("admin"),
  assignDeliveryHandler
);

// GET  /api/deliveries          → admin sees all | traveller sees available+own | dealer sees own
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "traveller", "dealer"),
  getDeliveries
);

// GET  /api/deliveries/:id      → delivery detail with order info
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "traveller", "dealer"),
  getDeliveryDetail
);

// PUT  /api/deliveries/:id/accept → traveller self-assigns the delivery
router.put(
  "/:id/accept",
  verifyToken,
  authorizeRoles("traveller"),
  acceptDeliveryHandler
);

// POST /api/deliveries/:id/update-status → traveller updates progress
router.post(
  "/:id/update-status",
  verifyToken,
  authorizeRoles("traveller"),
  updateStatusHandler
);

// GET  /api/deliveries/:id/tracking → full tracking history
router.get(
  "/:id/tracking",
  verifyToken,
  authorizeRoles("admin", "traveller", "dealer"),
  getTrackingHandler
);

// GET  /api/deliveries/tracking/:orderId → tracking by order ID
router.get(
  "/tracking/:orderId",
  verifyToken,
  authorizeRoles("admin", "dealer"),
  getTrackingByOrderIdHandler
);

module.exports = router;