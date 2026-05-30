// controllers/deliveryController.js
// Handles all business logic for delivery and tracking APIs.
//
// DELIVERY FLOW (Phase 10):
//   Admin creates delivery  → status = unassigned
//   Traveller self-assigns  → status = assigned
//   Traveller updates       → picked_up → in_transit → delivered / failed
//   Every status change is logged in delivery_tracking table
//
// Valid status sequence:
//   unassigned → assigned → picked_up → in_transit → delivered
//                                                   → failed

const {
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
} = require("../models/deliveryModel");

const { getOrderById, getDealerByUserId, updateOrderStatus } = require("../models/orderModel");
const { pool } = require("../config/db");

// Defines which status transitions are allowed
// Key = current status, Value = array of allowed next statuses
const VALID_TRANSITIONS = {
  assigned:   ["picked_up"],
  picked_up:  ["in_transit"],
  in_transit: ["delivered", "failed"],
};

// ─────────────────────────────────────────────────────────────
// CREATE DELIVERY   (admin only)
// POST /api/deliveries
// ─────────────────────────────────────────────────────────────
const createDeliveryHandler = async (req, res) => {
  try {
    const { order_id, pickup_address, delivery_address, estimated_delivery, notes } = req.body;

    // ── 1. Required fields ──────────────────────────────────
    if (!order_id || !pickup_address || !delivery_address) {
      return res.status(400).json({
        success: false,
        message: "order_id, pickup_address, and delivery_address are required",
      });
    }

    // ── 2. Order must exist ─────────────────────────────────
    const order = await getOrderById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${order_id} not found`,
      });
    }

    // ── 3. Payment must be verified before dispatch ─────────
    if (order.payment_status !== "verified") {
      return res.status(400).json({
        success: false,
        message: `Cannot create delivery. Order payment status is "${order.payment_status}". Payment must be verified first.`,
      });
    }

    // ── 4. Order status must be confirmed ────────────────────
    if (order.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: `Cannot create delivery. Order status is "${order.status}". Order must be confirmed first.`,
      });
    }

    // ── 5. Prevent duplicate delivery for same order ────────
    const existing = await getDeliveryByOrderId(order_id);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Delivery already exists for order ${order.order_number}`,
      });
    }

    // ── 6. Create delivery (status = unassigned) ────────────
    const newId = await createDelivery({
      orderId:           order_id,
      pickupAddress:     pickup_address,
      deliveryAddress:   delivery_address,
      estimatedDelivery: estimated_delivery || null,
      notes,
    });

    const newDelivery = await getDeliveryById(newId);

    return res.status(201).json({
      success: true,
      message: "Delivery created successfully. Waiting for traveller to accept.",
      data: newDelivery,
    });
  } catch (error) {
    console.error("Create delivery error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while creating delivery" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET DELIVERIES  (role-based list)
// GET /api/deliveries
// Admin     → all deliveries
// Traveller → unassigned + their own
// Dealer    → only their orders' deliveries
// ─────────────────────────────────────────────────────────────
const getDeliveries = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    let deliveries;

    if (role === "admin") {
      deliveries = await getAllDeliveries();

    } else if (role === "traveller") {
      // traveller_id column stores user.id directly
      deliveries = await getDeliveriesForTraveller(userId);

    } else if (role === "dealer") {
      const dealer = await getDealerByUserId(userId);
      if (!dealer) {
        return res.status(404).json({ success: false, message: "Dealer profile not found" });
      }
      deliveries = await getDeliveriesForDealer(dealer.id);
    }

    return res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries,
    });
  } catch (error) {
    console.error("Get deliveries error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while fetching deliveries" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET DELIVERY DETAIL
// GET /api/deliveries/:id
// Admin / Traveller / Dealer (own orders only)
// ─────────────────────────────────────────────────────────────
const getDeliveryDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const delivery = await getDeliveryById(id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: `Delivery with ID ${id} not found` });
    }

    // Dealer can only see their own order's delivery
    if (role === "dealer") {
      const dealer = await getDealerByUserId(userId);
      if (!dealer || delivery.dealer_id !== dealer.id) {
        return res.status(403).json({ success: false, message: "Access denied to this delivery" });
      }
    }

    // Traveller can only see unassigned or their own
    if (role === "traveller") {
      if (delivery.status !== "unassigned" && delivery.traveller_id !== userId) {
        return res.status(403).json({ success: false, message: "Access denied to this delivery" });
      }
    }

    // Fetch items for the order
    const [items] = await require("../config/db").pool.query(
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
      [delivery.order_id]
    );

    return res.status(200).json({ 
      success: true, 
      data: { ...delivery, items } 
    });
  } catch (error) {
    console.error("Get delivery detail error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while fetching delivery" });
  }
};

// ─────────────────────────────────────────────────────────────
// ACCEPT DELIVERY  (traveller self-assigns)
// PUT /api/deliveries/:id/accept
// Only traveller role
// ─────────────────────────────────────────────────────────────
const acceptDeliveryHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const travellerId = req.user.id;

    // ── 1. Check delivery exists ────────────────────────────
    const delivery = await getDeliveryById(id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: `Delivery with ID ${id} not found` });
    }

    // ── 2. Must be unassigned to accept ─────────────────────
    if (delivery.status !== "unassigned") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept. Delivery is already "${delivery.status}".`,
      });
    }

    // ── 3. Conditional update — prevents race conditions ────
    // acceptDelivery uses WHERE status='unassigned' AND traveller_id IS NULL
    // If two travellers click at the same moment, only ONE gets affectedRows=1
    const updated = await acceptDelivery(id, travellerId);

    if (updated === 0) {
      // Another traveller grabbed it between the check and the update
      return res.status(409).json({
        success: false,
        message: "Delivery was just accepted by another traveller. Please choose a different one.",
      });
    }

    // ── 4. Log first tracking entry automatically ───────────
    await addTrackingUpdate({
      deliveryId: id,
      updatedBy:  travellerId,
      status:     "assigned",
      location:   "Accepted by traveller",
      remark:     "Delivery self-assigned",
    });

    // ── 5. Update order status to assigned ──────────────────
    await updateOrderStatus(delivery.order_id, 'assigned');

    // ── 6. Update traveller status to on_delivery ───────────
    await pool.query("UPDATE travellers SET current_status = 'on_delivery' WHERE user_id = ?", [travellerId]);

    const updatedDelivery = await getDeliveryById(id);

    return res.status(200).json({
      success: true,
      message: "Delivery accepted successfully. Head to pickup location.",
      data: updatedDelivery,
    });
  } catch (error) {
    console.error("Accept delivery error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while accepting delivery" });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE DELIVERY STATUS + TRACKING
// POST /api/deliveries/:id/update-status
// Only the assigned traveller can update
// ─────────────────────────────────────────────────────────────
const updateStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const travellerId = req.user.id;
    const { status, location, remark } = req.body;

    // ── 1. Validate new status value ────────────────────────
    const ALLOWED_UPDATE_STATUSES = ["picked_up", "in_transit", "delivered", "failed"];
    if (!status || !ALLOWED_UPDATE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${ALLOWED_UPDATE_STATUSES.join(", ")}`,
      });
    }

    if (!location) {
      return res.status(400).json({ success: false, message: "location is required" });
    }

    // ── 2. Check delivery exists ────────────────────────────
    const delivery = await getDeliveryById(id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: `Delivery with ID ${id} not found` });
    }

    // ── 3. Only the assigned traveller can update ───────────
    if (delivery.traveller_id !== travellerId) {
      return res.status(403).json({
        success: false,
        message: "You can only update deliveries assigned to you",
      });
    }

    // ── 4. Enforce valid status sequence ────────────────────
    // e.g. can't go directly from assigned → delivered
    const allowedNext = VALID_TRANSITIONS[delivery.status];
    if (!allowedNext || !allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. Current status is "${delivery.status}". Allowed next: ${allowedNext ? allowedNext.join(", ") : "none (terminal state)"}`,
      });
    }

    // ── 5. Set actual_delivery if status = delivered ────────
    const actualDelivery = status === "delivered" ? new Date() : null;

    // ── 6. Update deliveries table ──────────────────────────
    await updateDeliveryStatus(id, status, actualDelivery);

    // ── 6.5 Update order status ─────────────────────────────
    await updateOrderStatus(delivery.order_id, status);
    
    // ── 6.6 Update traveller status if applicable ──────────
    if (status === 'delivered' || status === 'failed') {
      await pool.query("UPDATE travellers SET current_status = 'available' WHERE user_id = ?", [travellerId]);
    } else if (status === 'picked_up' || status === 'in_transit') {
      await pool.query("UPDATE travellers SET current_status = 'on_delivery' WHERE user_id = ?", [travellerId]);
    }

    // ── 7. Insert tracking history row ─────────────────────
    await addTrackingUpdate({
      deliveryId: id,
      updatedBy:  travellerId,
      status,
      location,
      remark: remark || null,
    });

    const updatedDelivery = await getDeliveryById(id);

    return res.status(200).json({
      success: true,
      message: `Delivery status updated to "${status}"`,
      data: updatedDelivery,
    });
  } catch (error) {
    console.error("Update delivery status error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while updating delivery status" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET TRACKING HISTORY
// GET /api/deliveries/:id/tracking
// Admin / Traveller (own) / Dealer (own orders)
// ─────────────────────────────────────────────────────────────
const getTrackingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    // ── 1. Check delivery exists ────────────────────────────
    const delivery = await getDeliveryById(id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: `Delivery with ID ${id} not found` });
    }

    // ── 2. Dealer — only their own orders ───────────────────
    if (role === "dealer") {
      const dealer = await getDealerByUserId(userId);
      if (!dealer || delivery.dealer_id !== dealer.id) {
        return res.status(403).json({ success: false, message: "Access denied to this delivery tracking" });
      }
    }

    // ── 3. Traveller — only their assigned deliveries ───────
    if (role === "traveller" && delivery.traveller_id !== userId) {
      return res.status(403).json({ success: false, message: "Access denied to this delivery tracking" });
    }

    // ── 4. Fetch full tracking history ──────────────────────
    const tracking = await getTrackingByDeliveryId(id);

    return res.status(200).json({
      success: true,
      delivery_id: id,
      order_number: delivery.order_number,
      current_status: delivery.status,
      count: tracking.length,
      data: tracking,
    });
  } catch (error) {
    console.error("Get tracking error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while fetching tracking" });
  }
};

// ─────────────────────────────────────────────────────────────
// ASSIGN DELIVERY (admin directly assigns order to traveller)
// POST /api/deliveries/assign
// ─────────────────────────────────────────────────────────────
const assignDeliveryHandler = async (req, res) => {
  try {
    const { order_id, traveller_id } = req.body;

    if (!order_id || !traveller_id) {
      return res.status(400).json({ success: false, message: "order_id and traveller_id are required" });
    }

    const parsedTravellerId = parseInt(traveller_id, 10);
    if (isNaN(parsedTravellerId)) {
      return res.status(400).json({ success: false, message: "traveller_id must be a valid number" });
    }

    const order = await getOrderById(order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: `Order with ID ${order_id} not found` });
    }

    let delivery = await getDeliveryByOrderId(order_id);

    if (!delivery) {
      // Create delivery if it doesn't exist
      const newId = await createDelivery({
        orderId: order_id,
        pickupAddress: "Main Warehouse", // Default
        deliveryAddress: order.delivery_address || "Pickup",
      });
      delivery = await getDeliveryById(newId);
    }

    // Force assignment
    await pool.query(
      `UPDATE deliveries SET traveller_id = ?, status = 'assigned', assigned_at = NOW() WHERE id = ?`,
      [traveller_id, delivery.id]
    );

    // Update order status to assigned
    await updateOrderStatus(order_id, 'assigned');

    // Update traveller status to on_delivery
    await pool.query("UPDATE travellers SET current_status = 'on_delivery' WHERE user_id = ?", [traveller_id]);

    // Add tracking
    await addTrackingUpdate({
      deliveryId: delivery.id,
      updatedBy: req.user.id,
      status: "assigned",
      location: "Assigned by Admin",
      remark: "Delivery assigned to traveller by admin",
    });

    return res.status(200).json({ success: true, message: "Delivery assigned successfully" });
  } catch (error) {
    console.error("Assign delivery error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while assigning delivery" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET TRACKING BY ORDER ID
// GET /api/deliveries/tracking/:orderId
// ─────────────────────────────────────────────────────────────
const getTrackingByOrderIdHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { id: userId, role } = req.user;

    // ── 1. Find delivery for this order ─────────────────────
    const delivery = await getDeliveryByOrderId(orderId);
    
    // If no delivery yet, return empty but success
    if (!delivery) {
      return res.status(200).json({
        success: true,
        data: [],
        status: "pending"
      });
    }

    // ── 2. Dealer security ──────────────────────────────────
    if (role === "dealer") {
      const dealer = await getDealerByUserId(userId);
      if (!dealer || delivery.dealer_id !== dealer.id) {
        return res.status(403).json({ success: false, message: "Access denied to this tracking" });
      }
    }

    // ── 3. Fetch tracking ───────────────────────────────────
    const tracking = await getTrackingByDeliveryId(delivery.id);

    return res.status(200).json({
      success: true,
      delivery_id: delivery.id,
      status: delivery.status,
      data: tracking,
      traveller: delivery.traveller_name ? {
        name: delivery.traveller_name,
        phone: delivery.traveller_phone
      } : null
    });
  } catch (error) {
    console.error("Get tracking by order ID error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while fetching tracking" });
  }
};

module.exports = {
  createDeliveryHandler,
  getDeliveries,
  getDeliveryDetail,
  acceptDeliveryHandler,
  updateStatusHandler,
  getTrackingHandler,
  assignDeliveryHandler,
  getTrackingByOrderIdHandler,
};