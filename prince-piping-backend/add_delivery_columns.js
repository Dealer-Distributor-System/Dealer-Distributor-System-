const { pool } = require("./config/db");

async function updateOrdersTable() {
  try {
    console.log("Adding delivery_type and delivery_cost to orders table...");
    
    // Check if columns exist first
    const [columns] = await pool.query("SHOW COLUMNS FROM orders");
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('delivery_type')) {
      await pool.query("ALTER TABLE orders ADD COLUMN delivery_type ENUM('pickup', 'delivery') DEFAULT 'pickup' AFTER total_amount");
      console.log("- Added delivery_type");
    }

    if (!columnNames.includes('delivery_cost')) {
      await pool.query("ALTER TABLE orders ADD COLUMN delivery_cost DECIMAL(10,2) DEFAULT 0.00 AFTER delivery_type");
      console.log("- Added delivery_cost");
    }

    console.log("✅ orders table updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to update orders table:", error.message);
    process.exit(1);
  }
}

updateOrdersTable();
