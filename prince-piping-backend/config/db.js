// config/db.js
// MySQL database connection using a connection pool.
// A pool reuses connections instead of opening a new one for every request,
// which is more efficient for a web application.

const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a pool of connections using values from .env
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // wait if all connections are busy
  connectionLimit: 10,      // max 10 simultaneous connections
  queueLimit: 0,            // unlimited queue
});

// Test the connection once when the server starts
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL database connected successfully");
    connection.release(); // always release the connection back to the pool
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // stop the server if DB connection fails
  }
};

module.exports = { pool, testConnection };
