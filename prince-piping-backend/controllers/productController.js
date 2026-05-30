// controllers/productController.js
// Handles the business logic for all product-related API requests.
// Each function corresponds to one API endpoint.
// It receives req/res, validates input, calls the model, and sends back JSON.

const {
  getAllProducts,
  getProductsCount,
  getProductById,
  getProductByName,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
} = require("../models/productModel");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────
// GET ALL PRODUCTS
// GET /api/products
// Access: All logged-in users (dealer, admin, traveller)
// ─────────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { category, q, sort, min, max } = req.query;
    const filters = { category, q, sort, min, max };

    const products = await getAllProducts(limit, offset, filters);
    const total = await getProductsCount(filters);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET SINGLE PRODUCT
// GET /api/products/:id
// Access: All logged-in users
// ─────────────────────────────────────────────────────────────
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await getProductById(id);

    // If product not found, return 404
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE PRODUCT
// POST /api/products
// Access: admin only
// ─────────────────────────────────────────────────────────────
const addProduct = async (req, res) => {
  try {
    const { name, description, specifications, price, stock, category_id, image_url } = req.body;

    // ── 1. Required field validation ──────────────────────
    if (!name || price === undefined || stock === undefined || !category_id) {
      return res.status(400).json({
        success: false,
        message: "name, price, stock, and category_id are required",
      });
    }

    // ── 2. Type validation ─────────────────────────────────
    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    if (isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a valid non-negative number",
      });
    }

    // ── 3. Check for duplicate product name ───────────────
    const existing = await getProductByName(name);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A product with the name "${name}" already exists`,
      });
    }

    // ── 4. Insert into database ────────────────────────────
    const newId = await createProduct({
      name: name.trim(),
      description,
      specifications,
      price: Number(price),
      stock: Number(stock),
      category_id,
      image_url,
    });

    // ── 5. Fetch the newly created product to return it ───
    const newProduct = await getProductById(newId);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Add product error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PRODUCT
// PUT /api/products/:id
// Access: admin only
// ─────────────────────────────────────────────────────────────
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, specifications, price, stock, category_id, image_url, is_available } = req.body;

    // ── 1. Check product exists ────────────────────────────
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    // ── 2. Required field validation ──────────────────────
    if (!name || price === undefined || stock === undefined || !category_id) {
      return res.status(400).json({
        success: false,
        message: "name, price, stock, and category_id are required",
      });
    }

    // ── 3. Type validation ─────────────────────────────────
    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    if (isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a valid non-negative number",
      });
    }

    // ── 4. Check for duplicate name (excluding current product) ──
    const duplicate = await getProductByName(name, id);
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Another product with the name "${name}" already exists`,
      });
    }

    // ── 5. Update in database ──────────────────────────────
    await updateProduct(id, {
      name: name.trim(),
      description,
      specifications,
      price: Number(price),
      stock: Number(stock),
      category_id,
      image_url,
      is_available: is_available !== undefined ? is_available : product.is_available,
    });

    // ── 6. Return updated product ──────────────────────────
    const updatedProduct = await getProductById(id);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating product",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE PRODUCT
// DELETE /api/products/:id
// Access: admin only
// ─────────────────────────────────────────────────────────────
const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // ── 1. Check product exists before deleting ────────────
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    // ── 2. Delete from database ────────────────────────────
    await deleteProduct(id);

    return res.status(200).json({
      success: true,
      message: `Product "${product.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Delete product error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};

const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an Excel file" });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Normalize headers to handle case variations and spaces
    const normalizeKey = (key) => {
      if (!key) return null;
      return String(key).trim().toLowerCase().replace(/\s+/g, '_');
    };

    const headerMap = {};
    if (rawData.length > 0) {
      const firstRow = rawData[0];
      Object.keys(firstRow).forEach(key => {
        const normalized = normalizeKey(key);
        headerMap[normalized] = key; // Map normalized to original
      });
    }

    const productsToInsert = [];
    const errors = [];

    rawData.forEach((row, index) => {
      const rowNum = index + 2; // Excel row number (1-based + header)

      // Get values using normalized headers
      const name = row[headerMap.name];
      const price = row[headerMap.price];
      const stock = row[headerMap.stock];
      const category_id = row[headerMap.category_id];

      if (!name || price === undefined || stock === undefined || !category_id) {
        errors.push({ row: rowNum, message: "Missing required fields (name, price, stock, category_id)" });
        return;
      }

      if (isNaN(Number(price)) || Number(price) < 0) {
        errors.push({ row: rowNum, message: "Invalid price format" });
        return;
      }

      if (isNaN(Number(stock)) || Number(stock) < 0) {
        errors.push({ row: rowNum, message: "Invalid stock format" });
        return;
      }

      productsToInsert.push({
        name: String(name).trim(),
        description: row[headerMap.description],
        specifications: row[headerMap.specifications],
        price: Number(price),
        stock: Number(stock),
        category_id: Number(category_id),
        image_url: row[headerMap.image_url],
        is_available: row[headerMap.is_available] === 0 ? false : true
      });
    });

    let insertedCount = 0;
    if (productsToInsert.length > 0) {
      insertedCount = await bulkCreateProducts(productsToInsert);
    }

    // Delete temp file
    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      inserted: insertedCount,
      failed: errors.length,
      errors: errors
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Bulk upload error:", error.message);
    return res.status(500).json({ success: false, message: "Server error during bulk upload" });
  }
};

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
  bulkUploadProducts,
};
