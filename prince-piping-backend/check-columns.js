const { pool } = require("./config/db");

async function checkSchema() {
  try {
    const [ordersColumns] = await pool.query("SHOW COLUMNS FROM orders");
    console.log("Orders Columns:");
    ordersColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`);
    });

    const [paymentsColumns] = await pool.query("SHOW COLUMNS FROM payments");
    console.log("\nPayments Columns:");
    paymentsColumns.forEach(col => {
      if (col.Field === 'status' || col.Field === 'payment_method') {
        console.log(`- ${col.Field}: ${col.Type}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error("Check failed:", error.message);
    process.exit(1);
  }
}

checkSchema();
