// middleware/authorizeRoles.js
// This middleware checks whether the logged-in user has
// the required role to access a specific route.
//
// Usage in routes:
//   router.get("/admin-only", verifyToken, authorizeRoles("admin"), handler)
//   router.get("/dealer-or-admin", verifyToken, authorizeRoles("admin", "dealer"), handler)
//
// Always use AFTER verifyToken — it needs req.user to exist.

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user.role is set by verifyToken middleware
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is for: ${allowedRoles.join(", ")} only.`,
      });
    }
    next(); // user has the right role, proceed
  };
};

module.exports = authorizeRoles;
