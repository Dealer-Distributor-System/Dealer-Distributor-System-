const express = require("express");
const router = express.Router();
const { getAllUsers, activateUser, deactivateUser, getTravellers, updateUserProfile } = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

router.use(verifyToken);

router.get("/", authorizeRoles("admin"), getAllUsers);
router.get("/travellers", authorizeRoles("admin"), getTravellers);
router.patch("/:id/activate", authorizeRoles("admin"), activateUser);
router.patch("/:id/deactivate", authorizeRoles("admin"), deactivateUser);
router.put("/:id", updateUserProfile); // Self-update check is inside controller

module.exports = router;
