const { pool } = require("./config/db");

async function fixEnum() {
  try {
    console.log("Updating orders.status ENUM...");
    await pool.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM(
        'pending', 
        'confirmed', 
        'rejected', 
        'assigned', 
        'picked_up', 
        'in_transit', 
        'delivered', 
        'cancelled',
        'failed'
      ) DEFAULT 'pending'
    `);
    console.log("✅ orders.status ENUM updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to update ENUM:", error.message);
    process.exit(1);
  }
}

fixEnum();
