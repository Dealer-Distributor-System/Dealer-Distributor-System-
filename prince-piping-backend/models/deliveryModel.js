// models/deliveryModel.js
// All database queries for deliveries and delivery_tracking tables.
// Controllers call these — no raw SQL outside this file.

const { pool } = require("../config/db");

// ─────────────────────────────────────────────────────────────
// DELIVERY QUERIES
// ─────────────────────────────────────────────────────────────

// Get a single delivery by its own ID (with order + dealer info)
const getDeliveryById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
       del.*,
       o.order_number,
       o.total_amount,
       o.status          AS order_status,
       o.payment_status,
       d.dealer_code,
       d.business_name,
       u.name            AS dealer_name,
       u.email           AS dealer_email,
       u.phone           AS dealer_phone
     FROM deliveries del
     JOIN orders  o ON del.order_id  = o.id
     JOIN dealers d ON o.dealer_id   = d.id
     JOIN users   u ON d.user_id     = u.id
     WHERE del.id = ?`,
    [id]
  );
  return rows[0];
};

// Check if delivery already exists for an order
const getDeliveryByOrderId = async (orderId) => {
  const [rows] = await pool.query(
    `SELECT 
       del.*, 
       o.dealer_id,
       t.name AS traveller_name,
       t.phone AS traveller_phone
     FROM deliveries del
     JOIN orders o ON del.order_id = o.id
     LEFT JOIN users t ON del.traveller_id = t.id
     WHERE del.order_id = ?`,
    [orderId]
  );
  return rows[0];
};

// Get ALL deliveries — admin view
const getAllDeliveries = async () => {
  const [rows] = await pool.query(
    `SELECT
       del.*,
       o.order_number,
       o.total_amount,
       d.business_name,
       u.name  AS dealer_name,
       t.name  AS traveller_name,
       t.phone AS traveller_phone
     FROM deliveries del
     JOIN orders  o  ON del.order_id    = o.id
     JOIN dealers d  ON o.dealer_id     = d.id
     JOIN users   u  ON d.user_id       = u.id
     LEFT JOIN users t ON del.traveller_id = t.id
     ORDER BY del.created_at DESC`
  );
  return rows;
};

// Get deliveries visible to a traveller:
//   - All unassigned deliveries (can self-assign)
//   - Their own assigned deliveries
const getDeliveriesForTraveller = async (travellerId) => {
  const [rows] = await pool.query(
    `SELECT
       del.*,
       o.order_number,
       o.total_amount,
       d.business_name,
       u.name AS dealer_name
     FROM deliveries del
     JOIN orders  o ON del.order_id = o.id
     JOIN dealers d ON o.dealer_id  = d.id
     JOIN users   u ON d.user_id    = u.id
     WHERE del.status = 'unassigned'
        OR del.traveller_id = ?
     ORDER BY del.created_at DESC`,
    [travellerId]
  );
  return rows;
};

// Get deliveries for a specific dealer (their own orders only)
const getDeliveriesForDealer = async (dealerId) => {
  const [rows] = await pool.query(
    `SELECT
       del.*,
       o.order_number,
       o.total_amount,
       t.name  AS traveller_name,
       t.phone AS traveller_phone
     FROM deliveries del
     JOIN orders  o  ON del.order_id      = o.id
     LEFT JOIN users t ON del.traveller_id = t.id
     WHERE o.dealer_id = ?
     ORDER BY del.created_at DESC`,
    [dealerId]
  );
  return rows;
};

// Create a new delivery record (admin action, status = unassigned)
const createDelivery = async ({
  orderId,
  pickupAddress,
  deliveryAddress,
  estimatedDelivery,
  notes,
}) => {
  const [result] = await pool.query(
    `INSERT INTO deliveries
       (order_id, pickup_address, delivery_address,
        estimated_delivery, notes, status)
     VALUES (?, ?, ?, ?, ?, 'unassigned')`,
    [
      orderId,
      pickupAddress,
      deliveryAddress,
      estimatedDelivery || null,
      notes || null,
    ]
  );
  return result.insertId;
};

// Self-assign: traveller accepts an unassigned delivery
// Uses conditional UPDATE to prevent race condition
// (two travellers clicking accept at the same moment)
// Only updates if status is STILL 'unassigned' at query time
const acceptDelivery = async (deliveryId, travellerId) => {
  const [result] = await pool.query(
    `UPDATE deliveries
     SET traveller_id = ?,
         assigned_at  = NOW(),
         status       = 'assigned',
         updated_at   = NOW()
     WHERE id = ?
       AND status = 'unassigned'
       AND traveller_id IS NULL`,
    [travellerId, deliveryId]
  );
  // affectedRows = 1 means success, 0 means someone else grabbed it first
  return result.affectedRows;
};

// Update delivery status (traveller updates progress)
const updateDeliveryStatus = async (deliveryId, status, actualDelivery = null) => {
  await pool.query(
    `UPDATE deliveries
     SET status           = ?,
         actual_delivery  = ?,
         updated_at       = NOW()
     WHERE id = ?`,
    [status, actualDelivery, deliveryId]
  );
};

// ─────────────────────────────────────────────────────────────
// DELIVERY TRACKING QUERIES
// ─────────────────────────────────────────────────────────────

// Insert one tracking update row
const addTrackingUpdate = async ({
  deliveryId,
  updatedBy,
  status,
  location,
  remark,
}) => {
  const [result] = await pool.query(
    `INSERT INTO delivery_tracking
       (delivery_id, updated_by, status, location, remark)
     VALUES (?, ?, ?, ?, ?)`,
    [deliveryId, updatedBy, status, location || null, remark || null]
  );
  return result.insertId;
};

// Get full tracking history for a delivery (oldest first)
const getTrackingByDeliveryId = async (deliveryId) => {
  const [rows] = await pool.query(
    `SELECT
       dt.*,
       u.name  AS updated_by_name,
       u.role  AS updated_by_role
     FROM delivery_tracking dt
     JOIN users u ON dt.updated_by = u.id
     WHERE dt.delivery_id = ?
     ORDER BY dt.created_at ASC`,
    [deliveryId]
  );
  return rows;
};

module.exports = {
  getDeliveryById,
  getDeliveryByOrderId,
  getAllDeliveries,
  getDeliveriesForTraveller,
  getDeliveriesForDealer,
  createDelivery,
  acceptDelivery,
  updateDeliveryStatus,
  addTrackingUpdate,
  getTrackingByDeliveryId,
};