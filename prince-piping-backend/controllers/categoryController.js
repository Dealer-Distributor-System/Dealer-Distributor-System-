// controllers/categoryController.js
// Handles all business logic for category-related API requests.
// Each function = one API endpoint.
// Receives req/res → validates input → calls model → returns JSON.

const {
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  countProductsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../models/categoryModel");

// ─────────────────────────────────────────────────────────────
// GET ALL CATEGORIES
// GET /api/categories
// Access: all logged-in users (dealer, admin, traveller)
// ─────────────────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET SINGLE CATEGORY
// GET /api/categories/:id
// Access: all logged-in users
// ─────────────────────────────────────────────────────────────
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching category",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE CATEGORY
// POST /api/categories
// Access: admin only
// ─────────────────────────────────────────────────────────────
const addCategory = async (req, res) => {
  try {
    // ── 1. Extract and trim input ──────────────────────────
    const name = req.body.name ? req.body.name.trim() : "";
    const description = req.body.description
      ? req.body.description.trim()
      : "";

    // ── 2. Validate: name is required ──────────────────────
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // ── 3. Check for duplicate name ────────────────────────
    const existing = await getCategoryByName(name);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category "${name}" already exists`,
      });
    }

    // ── 4. Insert into database ────────────────────────────
    const newId = await createCategory({ name, description });

    // ── 5. Fetch and return the newly created category ─────
    const newCategory = await getCategoryById(newId);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("Add category error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while creating category",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE CATEGORY
// PUT /api/categories/:id
// Access: admin only
// ─────────────────────────────────────────────────────────────
const editCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // ── 1. Check category exists ───────────────────────────
    const category = await getCategoryById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`,
      });
    }

    // ── 2. Extract and trim input ──────────────────────────
    const name = req.body.name ? req.body.name.trim() : "";
    const description = req.body.description
      ? req.body.description.trim()
      : "";

    // ── 3. Validate: name is required ──────────────────────
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // ── 4. Check for duplicate name (exclude current record)─
    const duplicate = await getCategoryByName(name, id);
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Another category with the name "${name}" already exists`,
      });
    }

    // ── 5. Update in database ──────────────────────────────
    await updateCategory(id, { name, description });

    // ── 6. Return updated record ───────────────────────────
    const updatedCategory = await getCategoryById(id);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating category",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE CATEGORY
// DELETE /api/categories/:id
// Access: admin only
// Business rule: cannot delete if products are linked to it
// ─────────────────────────────────────────────────────────────
const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // ── 1. Check category exists ───────────────────────────
    const category = await getCategoryById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`,
      });
    }

    // ── 2. Check if any product uses this category ─────────
    // Deleting a category that has products would break the
    // foreign key relationship and cause database errors.
    const linkedProducts = await countProductsByCategory(id);
    if (linkedProducts > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete "${category.name}". It has ${linkedProducts} product(s) linked to it. Remove or reassign those products first.`,
      });
    }

    // ── 3. Safe to delete ──────────────────────────────────
    await deleteCategory(id);

    return res.status(200).json({
      success: true,
      message: `Category "${category.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Delete category error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting category",
    });
  }
};

module.exports = {
  getCategories,
  getCategory,
  addCategory,
  editCategory,
  removeCategory,
};
