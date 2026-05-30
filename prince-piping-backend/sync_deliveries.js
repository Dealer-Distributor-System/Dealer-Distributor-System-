const { pool } = require("./config/db");

async function syncDeliveries() {
  try {
    console.log("Syncing delivery records for confirmed orders...");
    
    // Find orders that are 'confirmed' or later, have delivery_type 'delivery',
    // and don't have a record in the deliveries table.
    const [orders] = await pool.query(`
      SELECT o.id, o.order_number, o.delivery_address 
      FROM orders o
      LEFT JOIN deliveries d ON o.id = d.order_id
      WHERE o.status IN ('confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered')
        AND d.id IS NULL
    `);

    console.log(`Found ${orders.length} orders needing delivery records.`);

    for (const order of orders) {
      await pool.query(`
        INSERT INTO deliveries (order_id, pickup_address, delivery_address, status)
        VALUES (?, 'Main Warehouse', ?, 'unassigned')
      `, [order.id, order.delivery_address]);
      console.log(`- Created delivery for order #${order.order_number}`);
    }

    console.log("✅ Delivery sync complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to sync deliveries:", error.message);
    process.exit(1);
  }
}

syncDeliveries();
