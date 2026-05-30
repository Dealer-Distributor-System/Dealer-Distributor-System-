// routes/index.js
// Central place where all route files are registered.
// In future phases, just import and add new route files here.

const express = require("express");
const router = express.Router();

// ── Health check ────────────────────────────────────────────
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Prince Piping API is running",
    version: "1.0.0",
  });
});

// ── Phase 4: Auth routes (ACTIVE) ───────────────────────────
const authRoutes = require("./authRoutes");
router.use("/auth", authRoutes);

// ── Phase 5: Product routes (ACTIVE) ────────────────────────
const productRoutes = require("./productRoutes");
router.use("/products", productRoutes);

// ── Phase 6: Category routes (ACTIVE) ───────────────────────
const categoryRoutes = require("./categoryRoutes");
router.use("/categories", categoryRoutes);

// ── Phase 7: Cart routes (ACTIVE) ───────────────────────────
const cartRoutes = require("./cartRoutes");
router.use("/cart", cartRoutes);

// ── Phase 8: Order routes (ACTIVE) ──────────────────────────
const orderRoutes = require("./orderRoutes");
router.use("/orders", orderRoutes);


// ── Phase 9: Payment routes (ACTIVE) ────────────────────────
const paymentRoutes = require("./paymentRoutes");
router.use("/payments", paymentRoutes);


// ── Phase 10: Delivery routes (ACTIVE) ──────────────────────
const deliveryRoutes = require("./deliveryRoutes");
router.use("/deliveries", deliveryRoutes);

// ── Phase 11: Traveller routes (ACTIVE) ──────────────────────
const travellerRoutes = require("./travellerRoutes");
router.use("/travellers", travellerRoutes);

// ── Admin User Management ────────────────────────────────────
const userRoutes = require("./userRoutes");
router.use("/users", userRoutes);

// ── Admin Analytics ──────────────────────────────────────────
const analyticsRoutes = require("./analyticsRoutes");
router.use("/analytics", analyticsRoutes);

// ── Future routes (uncomment as you build each phase) ────────
// const paymentRoutes   = require("./paymentRoutes");
// const deliveryRoutes  = require("./deliveryRoutes");

// router.use("/payments",   paymentRoutes);
// router.use("/deliveries", deliveryRoutes);

module.exports = router;
