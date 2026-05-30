// update_schema_robust.js
const { pool } = require("./config/db");

const updateSchema = async () => {
  try {
    const [columns] = await pool.query("DESCRIBE users");
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('phone')) {
      console.log("Adding 'phone' column...");
      await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;");
    } else {
      console.log("'phone' column already exists.");
    }

    if (!columnNames.includes('address')) {
      console.log("Adding 'address' column...");
      await pool.query("ALTER TABLE users ADD COLUMN address TEXT NULL;");
    } else {
      console.log("'address' column already exists.");
    }

    console.log("Schema check complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error updating schema:", err.message);
    process.exit(1);
  }
};

updateSchema();
