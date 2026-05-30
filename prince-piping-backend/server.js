// server.js
// Main entry point for the Prince Piping backend.
// This file initializes Express, connects to MySQL,
// registers middleware and routes, then starts the server.

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection } = require("./config/db");
const routes = require("./routes/index");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

// ── Create Express App ───────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());                 // allow requests from the React frontend
app.use(express.json());         // parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // parse form data

// ── Routes ───────────────────────────────────────────────────
app.use("/api", routes);

// ── Root route (quick browser check) ────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Prince Piping Systems API",
  });
});

// ── 404 handler (must be after all routes) ───────────────────
app.use(notFound);

// ── Global error handler (must be last) ─────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
const startServer = async () => {
  await testConnection(); // confirm DB is reachable before accepting requests

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
