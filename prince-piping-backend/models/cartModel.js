// models/cartModel.js
// All database queries for carts and cart_items tables.
// Controllers call these — no raw SQL outside this file.

const { pool } = require("../config/db");

// ─────────────────────────────────────────────────────────────
// CART OPERATIONS
// ─────────────────────────────────────────────────────────────

// Get cart by dealer's user_id
// Each dealer has only ONE cart — we find it by user_id
const getCartByUserId = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM carts WHERE user_id = ?",
    [userId]
  );
  return rows[0]; // undefined if no cart yet
};

// Create a new cart for a dealer
// Called automatically when dealer adds first item
const createCart = async (userId) => {
  const [result] = await pool.query(
    "INSERT INTO carts (user_id) VALUES (?)",
    [userId]
  );
  return result.insertId; // returns new cart id
};

// ─────────────────────────────────────────────────────────────
// CART ITEM OPERATIONS
// ─────────────────────────────────────────────────────────────

// Get all items in a cart with full product details
// JOIN products and categories so frontend gets everything in one call
const getCartItemsWithDetails = async (cartId) => {
  const [rows] = await pool.query(
    `SELECT
       ci.id,
       ci.quantity,
       p.id            AS product_id,
       p.name,
       p.price,
       p.stock,
       p.image_url,
       p.is_available,
       c.id            AS category_id,
       c.name          AS category_name
     FROM cart_items ci
     JOIN products   p ON ci.product_id = p.id
     JOIN categories c ON p.category_id = c.id
     WHERE ci.cart_id = ?
     ORDER BY ci.id ASC`,
    [cartId]
  );
  return rows;
};

// Check if a specific product is already in the cart
// Used to decide: INSERT new row  OR  UPDATE existing quantity
const getCartItemByProductId = async (cartId, productId) => {
  const [rows] = await pool.query(
    "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cartId, productId]
  );
  return rows[0]; // undefined if product not in cart yet
};

// Get a single cart item by its own id
// Used in update and delete operations
const getCartItemById = async (itemId) => {
  const [rows] = await pool.query(
    "SELECT * FROM cart_items WHERE id = ?",
    [itemId]
  );
  return rows[0];
};

// Add a new product to the cart
const addCartItem = async (cartId, productId, quantity) => {
  const [result] = await pool.query(
    "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
    [cartId, productId, quantity]
  );
  return result.insertId;
};

// Increase quantity of a product already in the cart
const increaseCartItemQuantity = async (itemId, extraQuantity) => {
  await pool.query(
    "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
    [extraQuantity, itemId]
  );
};

// Set exact quantity for a cart item (used in PUT /update/:itemId)
const updateCartItemQuantity = async (itemId, quantity) => {
  await pool.query(
    "UPDATE cart_items SET quantity = ? WHERE id = ?",
    [quantity, itemId]
  );
};

// Remove a single item from the cart
const removeCartItem = async (itemId) => {
  const [result] = await pool.query(
    "DELETE FROM cart_items WHERE id = ?",
    [itemId]
  );
  return result.affectedRows;
};

// Remove ALL items from a cart (clear cart)
const clearCartItems = async (cartId) => {
  const [result] = await pool.query(
    "DELETE FROM cart_items WHERE cart_id = ?",
    [cartId]
  );
  return result.affectedRows;
};

module.exports = {
  getCartByUserId,
  createCart,
  getCartItemsWithDetails,
  getCartItemByProductId,
  getCartItemById,
  addCartItem,
  increaseCartItemQuantity,
  updateCartItemQuantity,
  removeCartItem,
  clearCartItems,
};
