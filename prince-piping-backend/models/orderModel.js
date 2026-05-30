// models/orderModel.js
// All database queries for the orders and order_items tables.
// Controllers call these — no raw SQL outside this file.

const { pool } = require("../config/db");
const { getFeedbackByOrderId } = require("./feedbackModel");

// ─────────────────────────────────────────────────────────────
// ORDER NUMBER GENERATOR
// Creates a unique order number like: ORD-2024-000001
// ─────────────────────────────────────────────────────────────
const generateOrderNumber = async () => {
  const year = new Date().getFullYear();

  // Count existing orders this year to get the next sequence number
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM orders WHERE YEAR(created_at) = ?",
    [year]
  );
  const sequence = String(rows[0].total + 1).padStart(6, "0");
  return `ORD-${year}-${sequence}`;
};

// ─────────────────────────────────────────────────────────────
// CREATE ORDER
// Inserts a new row into the orders table
// ─────────────────────────────────────────────────────────────
const createOrder = async ({
  dealerId,
  orderNumber,
  totalAmount,
  deliveryAddress,
  deliveryType,
  deliveryCost,
  notes,
}) => {
  const [result] = await pool.query(
    `INSERT INTO orders
       (dealer_id, order_number, total_amount, delivery_type, delivery_cost, 
        delivery_address, status, payment_status, notes)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?)`,
    [dealerId, orderNumber, totalAmount, deliveryType, deliveryCost, 
     deliveryAddress, notes || null]
  );
  return result.insertId;
};

// ─────────────────────────────────────────────────────────────
// INSERT ORDER ITEMS
// Saves a snapshot of each product's price at order time.
// This is important: if product price changes later,
// the order still records what the dealer was charged.
// ─────────────────────────────────────────────────────────────
const createOrderItems = async (orderId, items) => {
  // Build multi-row INSERT for all items at once (one query, not a loop)
  const values = items.map((item) => [
    orderId,
    item.product_id,
    item.quantity,
    item.price,        // snapshot of price at time of order
    item.quantity * item.price, // subtotal
  ]);

  await pool.query(
    `INSERT INTO order_items
       (order_id, product_id, quantity, unit_price, subtotal)
     VALUES ?`,
    [values]
  );
};

// ─────────────────────────────────────────────────────────────
// GET ALL ORDERS — used by admin (distributor) to see everything
// Joins dealers + users to show dealer name and business name
// ─────────────────────────────────────────────────────────────
const getAllOrders = async () => {
  const [rows] = await pool.query(
    `SELECT
       o.id,
       o.order_number,
       o.total_amount,
       o.status,
       o.payment_status,
       o.delivery_address,
       o.notes,
       o.approved_at,
       o.created_at,
       d.dealer_code,
       d.business_name,
       u.name  AS dealer_name,
       u.email AS dealer_email,
       u.phone AS dealer_phone
     FROM orders o
     JOIN dealers d ON o.dealer_id = d.id
     JOIN users   u ON d.user_id   = u.id
     ORDER BY o.created_at DESC`
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────
// GET ORDERS BY DEALER ID — used by dealer to see own orders only
// ─────────────────────────────────────────────────────────────
const getOrdersByDealerId = async (dealerId) => {
  const [rows] = await pool.query(
    `SELECT
       o.id,
       o.order_number,
       o.total_amount,
       o.status,
       o.payment_status,
       o.delivery_address,
       o.notes,
       o.approved_at,
       o.created_at
     FROM orders o
     WHERE o.dealer_id = ?
     ORDER BY o.created_at DESC`,
    [dealerId]
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────
// GET SINGLE ORDER WITH ALL ITS ITEMS
// ─────────────────────────────────────────────────────────────
const getOrderById = async (orderId) => {
  // Step 1: get the order row
  const [orderRows] = await pool.query(
    `SELECT
       o.*,
       d.dealer_code,
       d.business_name,
       u.name  AS dealer_name,
       u.email AS dealer_email
     FROM orders o
     JOIN dealers d ON o.dealer_id = d.id
     JOIN users   u ON d.user_id   = u.id
     WHERE o.id = ?`,
    [orderId]
  );

  if (orderRows.length === 0) return null;

  // Step 2: get all items for this order with product details
  const [itemRows] = await pool.query(
    `SELECT
       oi.id AS order_item_id,
       oi.quantity,
       oi.unit_price,
       oi.subtotal,
       p.id   AS product_id,
       p.name AS product_name,
       p.image_url,
       c.name AS category_name
     FROM order_items oi
     JOIN products   p ON oi.product_id  = p.id
     JOIN categories c ON p.category_id  = c.id
     WHERE oi.order_id = ?
     ORDER BY oi.id ASC`,
    [orderId]
  );

  // Step 3: combine order + its items into one object
  const feedback = await getFeedbackByOrderId(orderId);

  return {
    ...orderRows[0],
    items: itemRows,
    feedback,
  };
};

// ─────────────────────────────────────────────────────────────
// GET DEALER RECORD BY USER ID
// Orders use dealer.id (not user.id) as dealer_id FK
// ─────────────────────────────────────────────────────────────
const getDealerByUserId = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM dealers WHERE user_id = ?",
    [userId]
  );

  if (rows.length === 0) {
    // Lazy creation: check if user is a dealer and create profile if missing
    const [userRows] = await pool.query("SELECT name, role FROM users WHERE id = ?", [userId]);
    if (userRows.length > 0 && userRows[0].role === 'dealer') {
      const name = userRows[0].name || "Dealer";
      const dealerCode = `DLR-${Date.now()}`;
      const [result] = await pool.query(
        "INSERT INTO dealers (user_id, dealer_code, business_name) VALUES (?, ?, ?)",
        [userId, dealerCode, `${name}'s Business`]
      );
      return { id: result.insertId, user_id: userId, dealer_code: dealerCode, business_name: `${name}'s Business` };
    }
  }
  return rows[0];
};

// ─────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS
// Used by admin in Phase 9/10 (payment verification, dispatch)
// ─────────────────────────────────────────────────────────────
const updateOrderStatus = async (orderId, status, approvedBy = null) => {
  await pool.query(
    `UPDATE orders
     SET status = ?,
         approved_by = ?,
         approved_at = IF(? IN ('confirmed'), NOW(), approved_at),
         updated_at  = NOW()
     WHERE id = ?`,
    [status, approvedBy, status, orderId]
  );
};

module.exports = {
  generateOrderNumber,
  createOrder,
  createOrderItems,
  getAllOrders,
  getOrdersByDealerId,
  getOrderById,
  getDealerByUserId,
  updateOrderStatus,
};
