const { pool } = require("./config/db");

async function fixPaymentEnum() {
  try {
    console.log("Updating payments.payment_method ENUM...");
    await pool.query(`
      ALTER TABLE payments 
      MODIFY COLUMN payment_method ENUM('upi', 'bank_transfer', 'cash', 'cheque', 'razorpay') NOT NULL
    `);
    console.log("✅ payments.payment_method ENUM updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to update ENUM:", error.message);
    process.exit(1);
  }
}

fixPaymentEnum();
