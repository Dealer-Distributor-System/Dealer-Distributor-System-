// models/categoryModel.js
// All database queries for the categories table live here.
// Controllers call these functions — no raw SQL in the controller.

const { pool } = require("../config/db");

// ── Get all categories ───────────────────────────────────────
const getAllCategories = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM categories ORDER BY created_at DESC"
  );
  return rows;
};

// ── Get one category by ID ───────────────────────────────────
const getCategoryById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM categories WHERE id = ?",
    [id]
  );
  return rows[0]; // undefined if not found
};

// ── Get category by name (for duplicate check) ───────────────
// Pass excludeId when updating so we don't flag the same record
const getCategoryByName = async (name, excludeId = null) => {
  if (excludeId) {
    const [rows] = await pool.query(
      "SELECT id FROM categories WHERE name = ? AND id != ?",
      [name, excludeId]
    );
    return rows[0];
  }
  const [rows] = await pool.query(
    "SELECT id FROM categories WHERE name = ?",
    [name]
  );
  return rows[0];
};

// ── Check if any product uses this category ──────────────────
// Used before delete to prevent breaking product references
const countProductsByCategory = async (categoryId) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM products WHERE category_id = ?",
    [categoryId]
  );
  return rows[0].total; // returns a number
};

// ── Create a new category ────────────────────────────────────
const createCategory = async ({ name, description }) => {
  const [result] = await pool.query(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [name, description || null]
  );
  return result.insertId;
};

// ── Update an existing category ──────────────────────────────
const updateCategory = async (id, { name, description }) => {
  const [result] = await pool.query(
    "UPDATE categories SET name = ?, description = ? WHERE id = ?",
    [name, description || null, id]
  );
  return result.affectedRows; // 0 = nothing updated
};

// ── Delete a category ────────────────────────────────────────
const deleteCategory = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM categories WHERE id = ?",
    [id]
  );
  return result.affectedRows; // 0 = nothing deleted
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  countProductsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
