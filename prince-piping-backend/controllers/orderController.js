// controllers/orderController.js
// Handles all business logic for order-related API requests.
//
// ORDER FLOW (Phase 8):
//   1. Dealer fills cart (Phase 7)
//   2. Dealer calls POST /api/orders → cart converts to order
//   3. Cart is cleared automatically after order is created
//   4. Payment is handled in Phase 9 (not here)
//   5. Delivery is handled in Phase 10 (not here)
//
// DELIVERY COST LOGIC:
//   pickup   → ₹0
//   delivery → distance in km × ₹100

const {
  generateOrderNumber,
  createOrder,
  createOrderItems,
  getAllOrders,
  getOrdersByDealerId,
  getOrderById,
  getDealerByUserId,
  updateOrderStatus,
} = require("../models/orderModel");

const { pool } = require("../config/db");

const {
  createDelivery,
  getDeliveryByOrderId,
} = require("../models/deliveryModel");

const {
  createFeedback,
  getFeedbackByOrderId,
} = require("../models/feedbackModel");

const {
  getCartByUserId,
  getCartItemsWithDetails,
  clearCartItems,
} = require("../models/cartModel");

const DELIVERY_RATE_PER_KM = 100.00;
const VALID_DELIVERY_TYPES = ["pickup", "delivery"];

// ─────────────────────────────────────────────────────────────
// PLACE ORDER  (Convert cart → order)
// POST /api/orders
// Access: dealer only
// ─────────────────────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { delivery_type, delivery_address, delivery_distance_km, notes } = req.body;

    // ── 1. Validate delivery_type ──────────────────────────
    if (!delivery_type || !VALID_DELIVERY_TYPES.includes(delivery_type)) {
      return res.status(400).json({
        success: false,
        message: `delivery_type is required and must be one of: ${VALID_DELIVERY_TYPES.join(", ")}`,
      });
    }

    // ── 2. delivery_address is required when type = "delivery"
    if (delivery_type === "delivery" && !delivery_address) {
      return res.status(400).json({
        success: false,
        message: "delivery_address is required when delivery_type is 'delivery'",
      });
    }

    const deliveryDistanceKm = Number(delivery_distance_km || 0);
    if (delivery_type === "delivery" && (!Number.isFinite(deliveryDistanceKm) || deliveryDistanceKm <= 0)) {
      return res.status(400).json({
        success: false,
        message: "delivery_distance_km is required when delivery_type is 'delivery'",
      });
    }

    // ── 3. Get the dealer's profile record ─────────────────
    // Orders use dealers.id (FK), not users.id
    const dealer = await getDealerByUserId(userId);
    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: "Dealer profile not found. Please contact admin.",
      });
    }

    // ── 4. Get dealer's cart ───────────────────────────────
    const cart = await getCartByUserId(userId);
    if (!cart) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add products before placing an order.",
      });
    }

    // ── 5. Get all cart items with product details ─────────
    const cartItems = await getCartItemsWithDetails(cart.id);
    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add products before placing an order.",
      });
    }

    // ── 6. Calculate subtotal from cart items ──────────────
    // We use the CURRENT product price from DB at time of order.
    // This price is then saved into order_items as a snapshot.
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);

    // ── 7. Apply delivery cost logic ───────────────────────
    const deliveryCost = delivery_type === "delivery" ? deliveryDistanceKm * DELIVERY_RATE_PER_KM : 0;
    const totalAmount = parseFloat((subtotal + deliveryCost).toFixed(2));

    // ── 8. Generate unique order number ────────────────────
    const orderNumber = await generateOrderNumber();

    // ── 9-12. Insert order and items, then decrement stock with conditional updates.
    // This approach uses conditional UPDATEs (stock >= qty) and performs cleanup if any
    // decrement fails. It avoids relying on transactional row-locking which may not be
    // available if the DB tables aren't InnoDB.

    // Insert order row
    const [orderResult] = await pool.query(
      `INSERT INTO orders
         (dealer_id, order_number, total_amount, delivery_type, delivery_cost, 
          delivery_address, status, payment_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?)`,
      [dealer.id, orderNumber, totalAmount, delivery_type, deliveryCost, delivery_type === "delivery" ? delivery_address : "Pickup", notes || null]
    );
    const newOrderId = orderResult.insertId;

    // Build and insert order items
    const values = cartItems.map((item) => [
      newOrderId,
      item.product_id,
      item.quantity,
      parseFloat(item.price),
      item.quantity * parseFloat(item.price),
    ]);

    await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES ?`,
      [values]
    );

    // Attempt to decrement stock for each item using a conditional update
    for (const item of cartItems) {
      const [updateRes] = await pool.query(
        `UPDATE products SET stock = stock - ?, is_available = IF(stock - ? <= 0, 0, 1) WHERE id = ? AND stock >= ?`,
        [item.quantity, item.quantity, item.product_id, item.quantity]
      );

      // If no rows were affected, stock was insufficient
      if (updateRes.affectedRows === 0) {
        // Cleanup: remove inserted order_items and order
        await pool.query(`DELETE FROM order_items WHERE order_id = ?`, [newOrderId]);
        await pool.query(`DELETE FROM orders WHERE id = ?`, [newOrderId]);

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ID ${item.product_id}. Order cancelled.`,
        });
      }
    }

    // Clear cart items
    await pool.query("DELETE FROM cart_items WHERE cart_id = ?", [cart.id]);

    // Fetch the created order to return
    const createdOrder = await getOrderById(newOrderId);
    return res.status(201).json({
      success: true,
      message: `Order ${orderNumber} placed successfully! Please complete payment to confirm.`,
      data: createdOrder,
    });
  } catch (error) {
    console.error("Place order error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while placing order",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET ALL ORDERS
// GET /api/orders
// Access:
//   dealer → sees ONLY their own orders
//   admin  → sees ALL orders
// ─────────────────────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let orders;

    if (role === "admin") {
      // Admin sees every order in the system
      orders = await getAllOrders();
    } else {
      // Dealer sees only their own orders
      const dealer = await getDealerByUserId(userId);
      if (!dealer) {
        return res.status(404).json({
          success: false,
          message: "Dealer profile not found.",
        });
      }
      orders = await getOrdersByDealerId(dealer.id);
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET SINGLE ORDER WITH ITEMS
// GET /api/orders/:id
// Access:
//   dealer → only their own order
//   admin  → any order
// ─────────────────────────────────────────────────────────────
const getOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { id: userId, role } = req.user;

    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${orderId} not found`,
      });
    }

    // If dealer, check the order belongs to them
    if (role === "dealer") {
      const dealer = await getDealerByUserId(userId);
      if (!dealer || order.dealer_id !== dealer.id) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to view this order",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS   (admin only)
// PATCH /api/orders/:id/status
// Used by admin to approve / reject / cancel orders
// Full delivery status update is handled in Phase 10
// ─────────────────────────────────────────────────────────────
const changeOrderStatus = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { status } = req.body;
    const adminUserId = req.user.id;

    const VALID_STATUSES = [
      "pending", "confirmed", "assigned", "picked_up", "in_transit", "delivered", "cancelled", "rejected", "failed"
    ];

    // ── 1. Validate status value ───────────────────────────
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    // ── 2. Check order exists ──────────────────────────────
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${orderId} not found`,
      });
    }

    // ── 3. Update the status ───────────────────────────────
    await updateOrderStatus(orderId, status, adminUserId);

    // ── 3.5 Create delivery record if confirmed ────────────
    if (status === "confirmed") {
      const existingDelivery = await getDeliveryByOrderId(orderId);
      if (!existingDelivery) {
        await createDelivery({
          orderId,
          pickupAddress: "Main Warehouse",
          deliveryAddress: order.delivery_address,
        });
      }
    }

    // ── 4. Return updated order ────────────────────────────
    const updatedOrder = await getOrderById(orderId);

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
};

const submitOrderFeedback = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { id: userId } = req.user;
    const rating = Number(req.body.rating);
    const description = String(req.body.description || "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5 stars",
      });
    }

    if (description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Feedback description must be 1000 characters or less",
      });
    }

    const dealer = await getDealerByUserId(userId);
    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: "Dealer profile not found.",
      });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${orderId} not found`,
      });
    }

    if (order.dealer_id !== dealer.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to submit feedback for this order",
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Feedback can be submitted only after the order is delivered",
      });
    }

    const existingFeedback = await getFeedbackByOrderId(orderId);
    if (existingFeedback) {
      return res.status(409).json({
        success: false,
        message: "Feedback has already been submitted for this order",
        data: existingFeedback,
      });
    }

    const feedback = await createFeedback({
      orderId,
      dealerId: dealer.id,
      rating,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Submit order feedback error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting feedback",
    });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrder,
  changeOrderStatus,
  submitOrderFeedback,
};
