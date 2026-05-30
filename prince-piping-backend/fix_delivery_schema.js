const { pool } = require("./config/db");

async function fixDeliverySchema() {
  try {
    console.log("Fixing deliveries.traveller_id foreign key...");
    
    // 1. Drop existing foreign key
    // The constraint name was found earlier: deliveries_ibfk_2
    try {
      await pool.query("ALTER TABLE deliveries DROP FOREIGN KEY deliveries_ibfk_2");
      console.log("- Dropped old foreign key constraint");
    } catch (e) {
      console.log("- Old foreign key constraint not found or already dropped");
    }

    // 2. Add new foreign key referencing users(id)
    await pool.query(`
      ALTER TABLE deliveries 
      ADD CONSTRAINT fk_delivery_traveller_user 
      FOREIGN KEY (traveller_id) REFERENCES users(id)
    `);
    console.log("- Added new foreign key referencing users(id)");

    console.log("✅ deliveries table schema fixed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to fix schema:", error.message);
    process.exit(1);
  }
}

fixDeliverySchema();
