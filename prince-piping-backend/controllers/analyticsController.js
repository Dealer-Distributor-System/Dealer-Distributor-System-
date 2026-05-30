const { pool } = require("../config/db");

// ─────────────────────────────────────────────────────────────
// GET ALL ANALYTICS DATA
// GET /api/analytics
// Access: admin only
// ─────────────────────────────────────────────────────────────
const getAdminAnalytics = async (req, res) => {
  try {
    if (req.user) {
      console.log("Fetching analytics for admin:", req.user.id);
    }
    
    // 1. Orders Per Day (Last 30 days)
    const [ordersPerDay] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as orders
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 2. Revenue Trend (Last 30 days)
    const [revenueTrend] = await pool.query(`
      SELECT DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE (payment_status = 'verified' OR payment_status = 'paid') AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 3. Delivery Status Distribution
    const [deliveryStatus] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM deliveries
      GROUP BY status
    `);

    // 4. Top Selling Products
    const [topProducts] = await pool.query(`
      SELECT p.name, SUM(oi.quantity) as quantity
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY quantity DESC
      LIMIT 5
    `);

    return res.status(200).json({
      success: true,
      data: {
        ordersPerDay: ordersPerDay || [],
        revenueTrend: revenueTrend || [],
        deliveryStatus: deliveryStatus || [],
        topProducts: topProducts || []
      }
    });
  } catch (error) {
    console.error("CRITICAL ANALYTICS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching analytics",
    });
  }
};

module.exports = {
  getAdminAnalytics,
};
