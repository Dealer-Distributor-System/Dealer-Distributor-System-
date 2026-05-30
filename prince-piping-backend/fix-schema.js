const { pool } = require("./config/db");

async function fixSchema() {
  try {
    console.log("Updating database schema...");
    
    // Add 'razorpay' to payments.payment_method
    await pool.query(`
      ALTER TABLE payments 
      MODIFY COLUMN payment_method ENUM('cash', 'cheque', 'upi', 'bank_transfer', 'razorpay') NOT NULL
    `);
    console.log("✅ Added 'razorpay' to payments.payment_method");

    // Add 'confirmed' to orders.status if it's missing, but wait...
    // Let's check what the current enum is. 
    // Actually, I'll just change the code to use 'confirmed' if that's what the system expects.
    
    console.log("Schema update complete.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Schema update failed:", error.message);
    process.exit(1);
  }
}

fixSchema();
