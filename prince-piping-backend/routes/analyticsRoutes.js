const express = require("express");
const router = express.Router();
const { getAdminAnalytics } = require("../controllers/analyticsController");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

// GET /api/analytics → admin only
router.get("/", verifyToken, authorizeRoles("admin"), getAdminAnalytics);

module.exports = router;
