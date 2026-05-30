// init-db.js
// Initialize the database by running the SQL schema

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function initializeDatabase() {
  let connection = null;

  try {
    // Step 1: Connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Read the SQL file
    const sqlPath = path.join(__dirname, "..", "databse.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Split by statements and filter out comments and empty lines
    const lines = sql.split("\n");
    let currentStatement = "";
    const statements = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Remove inline comments (-- comment)
      const commentIndex = line.indexOf('--');
      if (commentIndex !== -1) {
        line = line.substring(0, commentIndex);
      }
      
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) {
        continue;
      }
      
      currentStatement += " " + trimmed;
      
      // Check if statement ends with semicolon
      if (trimmed.endsWith(";")) {
        const stmt = currentStatement.trim().replace(/\s+/g, ' ');
        // Filter out SELECT statements (they're not needed for schema setup)
        if (!stmt.toUpperCase().startsWith("SELECT")) {
          statements.push(stmt);
        }
        currentStatement = "";
      }
    }

    // Execute each statement
    for (const statement of statements) {
      const preview = statement.substring(0, 60).replace(/\s+/g, " ");
      console.log(`Executing: ${preview}...`);
      try {
        await connection.query(statement);
      } catch (err) {
        // Only log warnings for non-critical errors
        if (err.code === "ER_BAD_DB_ERROR" || err.code === "ER_DB_DROP_DELETE") {
          console.log(`⚠️  ${err.message}`);
        } else {
          console.error(`Error executing: ${statement.substring(0, 100)}`);
          throw err;
        }
      }
    }

    await connection.end();
    console.log("✅ Database initialized successfully!");

    // Step 2: Test connection with the new database
    console.log("\nTesting connection to new database...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    const [rows] = await connection.query("SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = ?", [process.env.DB_NAME]);
    console.log(`✅ Found ${rows[0].table_count} tables in the database`);
    
    await connection.end();
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initializeDatabase();
