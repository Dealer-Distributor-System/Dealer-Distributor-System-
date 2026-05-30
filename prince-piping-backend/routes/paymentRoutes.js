// routes/paymentRoutes.js
// Maps URL endpoints to controller functions for payments.
//
// Access summary:
//   POST /api/payments            → dealer only  (submit payment)
//   GET  /api/payments/my         → dealer only  (own payment history)
//   GET  /api/payments            → admin only   (all payments)
//   PUT  /api/payments/:id/verify → admin only   (verify payment)
//   PUT  /api/payments/:id/reject → admin only   (reject with remark)

const express = require("express");
const router  = express.Router();

const {
  submitPayment,
  getMyPayments,
  getAllPaymentsHandler,
  verifyPaymentHandler,
  rejectPaymentHandler,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");

const verifyToken    = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

// POST /api/payments              → dealer submits payment proof
router.post(
  "/",
  verifyToken,
  authorizeRoles("dealer"),
  submitPayment
);

// GET  /api/payments/my           → dealer views their own payments
// IMPORTANT: this route must come BEFORE /:id to avoid conflict
router.get(
  "/my",
  verifyToken,
  authorizeRoles("dealer"),
  getMyPayments
);

// GET  /api/payments              → admin views all payments
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  getAllPaymentsHandler
);

// PUT  /api/payments/:id/verify   → admin verifies payment
router.put(
  "/:id/verify",
  verifyToken,
  authorizeRoles("admin"),
  verifyPaymentHandler
);

// PUT  /api/payments/:id/reject   → admin rejects with remark
router.put(
  "/:id/reject",
  verifyToken,
  authorizeRoles("admin"),
  rejectPaymentHandler
);

// POST /api/payments/create-order → Initialize Razorpay order
router.post(
  "/create-order",
  verifyToken,
  authorizeRoles("dealer"),
  createRazorpayOrder
);

// POST /api/payments/verify       → Verify Razorpay payment
router.post(
  "/verify",
  verifyToken,
  authorizeRoles("dealer"),
  verifyRazorpayPayment
);

module.exports = router;