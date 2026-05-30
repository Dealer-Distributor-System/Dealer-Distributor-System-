// routes/travellerRoutes.js
const express = require("express");
const router = express.Router();
const { getTravellers } = require("../controllers/travellerController");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

// GET /api/travellers
router.get("/", verifyToken, authorizeRoles("admin"), getTravellers);

module.exports = router;
