// models/productModel.js
// This file contains all database queries related to products.
// Controllers call these functions — they don't write SQL directly.
// This separation makes it easy to change queries without touching the controller.

const { pool } = require("../config/db");

// ── Build Product Query Helper ────────────────────────────────
const buildProductQuery = (filters, isCount = false, limit = null, offset = null) => {
  let sql = "";
  const params = [];
  const whereClauses = [];

  if (isCount) {
    sql = "SELECT COUNT(DISTINCT p.id) as total FROM products p";
  } else {
    sql = "SELECT p.*, c.name AS category_name FROM products p";
  }

  // Always join categories to support category name filtering and category_name field
  sql += " LEFT JOIN categories c ON p.category_id = c.id";

  // Category filter
  if (filters.category) {
    if (/^\d+$/.test(filters.category)) {
      whereClauses.push("p.category_id = ?");
      params.push(parseInt(filters.category));
    } else {
      whereClauses.push("LOWER(c.name) = LOWER(?)");
      params.push(filters.category.trim());
    }
  }

  // Search query filter (search by name, description, specifications)
  if (filters.q) {
    whereClauses.push("(p.name LIKE ? OR p.description LIKE ? OR p.specifications LIKE ?)");
    const searchTerm = `%${filters.q.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // Min price filter
  if (filters.min !== undefined && filters.min !== null && filters.min !== "") {
    whereClauses.push("p.price >= ?");
    params.push(parseFloat(filters.min));
  }

  // Max price filter
  if (filters.max !== undefined && filters.max !== null && filters.max !== "") {
    whereClauses.push("p.price <= ?");
    params.push(parseFloat(filters.max));
  }

  // Add WHERE clauses to SQL
  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  if (!isCount) {
    // Sort
    const sortField = filters.sort || "newest";
    switch (sortField) {
      case "price_low":
        sql += " ORDER BY p.price ASC";
        break;
      case "price_high":
        sql += " ORDER BY p.price DESC";
        break;
      case "stock":
        sql += " ORDER BY p.stock DESC";
        break;
      case "newest":
      default:
        sql += " ORDER BY p.created_at DESC";
        break;
    }

    // Limit and Offset
    if (limit !== null && offset !== null) {
      sql += " LIMIT ? OFFSET ?";
      params.push(limit, offset);
    }
  }

  return { sql, params };
};

// ── Get all products ─────────────────────────────────────────
const getAllProducts = async (limit = 100, offset = 0, filters = {}) => {
  const { sql, params } = buildProductQuery(filters, false, limit, offset);
  const [rows] = await pool.query(sql, params);
  return rows;
};

const getProductsCount = async (filters = {}) => {
  const { sql, params } = buildProductQuery(filters, true);
  const [rows] = await pool.query(sql, params);
  return rows[0].total;
};

// ── Get one product by ID ────────────────────────────────────
const getProductById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM products WHERE id = ?",
    [id]
  );
  return rows[0]; // returns undefined if not found
};

// ── Check if product name already exists ─────────────────────
// Used to prevent duplicates. Excludes current product when updating.
const getProductByName = async (name, excludeId = null) => {
  if (excludeId) {
    const [rows] = await pool.query(
      "SELECT id FROM products WHERE name = ? AND id != ?",
      [name, excludeId]
    );
    return rows[0];
  }
  const [rows] = await pool.query(
    "SELECT id FROM products WHERE name = ?",
    [name]
  );
  return rows[0];
};

// ── Create a new product ─────────────────────────────────────
const createProduct = async ({ name, description, specifications, price, stock, category_id, image_url }) => {
  const [result] = await pool.query(
    `INSERT INTO products (name, description, specifications, price, stock, category_id, image_url, is_available)
     VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [name, description || null, specifications || null, price, stock, category_id, image_url || null]
  );
  return result.insertId;
};

// ── Update an existing product ───────────────────────────────
const updateProduct = async (id, { name, description, specifications, price, stock, category_id, image_url, is_available }) => {
  const [result] = await pool.query(
    `UPDATE products
     SET name = ?, description = ?, specifications = ?, price = ?,
         stock = ?, category_id = ?, image_url = ?, is_available = ?,
         updated_at = NOW()
     WHERE id = ?`,
    [name, description || null, specifications || null, price, stock, category_id, image_url || null, is_available, id]
  );
  return result.affectedRows; // 0 means no row was updated
};

// ── Delete a product ─────────────────────────────────────────
const deleteProduct = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM products WHERE id = ?",
    [id]
  );
  return result.affectedRows; // 0 means product didn't exist
};

const bulkCreateProducts = async (products) => {
  if (products.length === 0) return 0;
  
  const values = products.map(p => [
    p.name, 
    p.description || null, 
    p.specifications || null, 
    p.price, 
    p.stock, 
    p.category_id, 
    p.image_url || null, 
    p.is_available !== undefined ? p.is_available : true
  ]);

  const [result] = await pool.query(
    `INSERT INTO products (name, description, specifications, price, stock, category_id, image_url, is_available)
     VALUES ?`,
    [values]
  );
  return result.affectedRows;
};

module.exports = {
  getAllProducts,
  getProductsCount,
  getProductById,
  getProductByName,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
};
