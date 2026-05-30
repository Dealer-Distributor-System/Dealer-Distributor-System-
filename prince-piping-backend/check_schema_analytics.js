const { pool } = require("./config/db");

async function checkOrders() {
  const [orders] = await pool.query("DESCRIBE orders");
  const [items] = await pool.query("DESCRIBE order_items");
  const [deliveries] = await pool.query("DESCRIBE deliveries");
  console.log("ORDERS TABLE:");
  console.table(orders);
  console.log("ORDER_ITEMS TABLE:");
  console.table(items);
  console.log("DELIVERIES TABLE:");
  console.table(deliveries);
  process.exit(0);
}

checkOrders();
