// update_schema.js
const { pool } = require("./config/db");

const updateSchema = async () => {
  try {
    console.log("Adding phone and address columns to users table...");
    await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL, ADD COLUMN address TEXT NULL;");
    console.log("Schema updated successfully!");
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Columns already exist.");
      process.exit(0);
    }
    console.error("Error updating schema:", err.message);
    process.exit(1);
  }
};

updateSchema();
