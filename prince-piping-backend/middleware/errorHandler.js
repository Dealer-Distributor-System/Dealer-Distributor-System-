// middleware/errorHandler.js
// Global error handler middleware.
// Any error passed via next(error) in a route lands here.
// This keeps error responses consistent across the whole API.

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
