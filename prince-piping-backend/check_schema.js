// check_schema.js
const { pool } = require("./config/db");

const checkSchema = async () => {
  try {
    const [columns] = await pool.query("DESCRIBE users");
    console.table(columns);
    process.exit(0);
  } catch (err) {
    console.error("Error checking schema:", err.message);
    process.exit(1);
  }
};

checkSchema();
