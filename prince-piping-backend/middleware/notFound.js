// middleware/notFound.js
// Catches any request that didn't match a defined route
// and returns a clean 404 response.

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFound;
