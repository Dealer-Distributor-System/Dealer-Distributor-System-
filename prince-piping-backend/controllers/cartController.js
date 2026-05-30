// controllers/cartController.js
// Handles all business logic for cart-related API requests.
// Only dealers can reach these functions (enforced by authorizeRoles in routes).
//
// KEY CONCEPT: Each dealer has ONE cart.
//   - If the cart doesn't exist yet → create it automatically.
//   - If the product is already in the cart → increase quantity.
//   - Cart is a TEMPORARY staging area — orders are created in Phase 8.

const {
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
} = require("../models/cartModel");

const { getProductById } = require("../models/productModel");
const { getOrderById, getDealerByUserId } = require("../models/orderModel");

// ─────────────────────────────────────────────────────────────
// HELPER — Get or create a cart for the logged-in dealer
// Used internally in addToCart so we never fail on missing cart
// ─────────────────────────────────────────────────────────────
const getOrCreateCart = async (userId) => {
  let cart = await getCartByUserId(userId);
  if (!cart) {
    // Dealer is adding their first item — create the cart now
    const newCartId = await createCart(userId);
    cart = { id: newCartId, user_id: userId };
  }
  return cart;
};

// ─────────────────────────────────────────────────────────────
// ADD TO CART
// POST /api/cart/add
// Access: dealer only
// ─────────────────────────────────────────────────────────────
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id; // set by verifyToken middleware

    // ── 1. Validate required fields ───────────────────────
    if (!product_id || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "product_id and quantity are required",
      });
    }

    // ── 2. Validate quantity is a positive integer ─────────
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer (1 or more)",
      });
    }

    // ── 3. Check the product actually exists in DB ─────────
    const product = await getProductById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${product_id} not found`,
      });
    }

    // ── 4. Check product is currently available ────────────
    if (!product.is_available) {
      return res.status(400).json({
        success: false,
        message: `"${product.name}" is currently not available`,
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: `"${product.name}" is out of stock`,
      });
    }

    // ── 5. Get existing cart OR create one automatically ───
    const cart = await getOrCreateCart(userId);

    // ── 6. Check if this product is already in the cart ───
    const existingItem = await getCartItemByProductId(cart.id, product_id);
    const totalRequested = qty + (existingItem?.quantity || 0);

    if (totalRequested > product.stock) {
      const availableQuantity = product.stock - (existingItem?.quantity || 0);
      return res.status(400).json({
        success: false,
        message: availableQuantity > 0
          ? `Only ${availableQuantity} more unit(s) of "${product.name}" can be added to your cart.`
          : `"${product.name}" is out of stock for additional quantity.`,
      });
    }

    if (existingItem) {
      // Product already in cart → just increase quantity
      await increaseCartItemQuantity(existingItem.id, qty);
    } else {
      // New product → add fresh row to cart_items
      await addCartItem(cart.id, product_id, qty);
    }

    // ── 7. Return the full updated cart ───────────────────
    const updatedItems = await getCartItemsWithDetails(cart.id);

    return res.status(200).json({
      success: true,
      message: existingItem
        ? `Quantity updated for "${product.name}"`
        : `"${product.name}" added to cart`,
      data: {
        cart_id: cart.id,
        items: updatedItems,
        total_items: updatedItems.length,
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while adding to cart",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// REORDER AN EXISTING ORDER
// POST /api/cart/reorder/:orderId
// Access: dealer only
// ─────────────────────────────────────────────────────────────
const reorderFromOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const dealer = await getDealerByUserId(userId);
    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: "Dealer profile not found. Please contact admin.",
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
        message: "You are not allowed to reorder this order",
      });
    }

    if (!order.items || order.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This order contains no items to reorder",
      });
    }

    const cart = await getOrCreateCart(userId);
    const errors = [];
    let totalAdded = 0;

    for (const item of order.items) {
      const product = await getProductById(item.product_id);
      if (!product || !product.is_available || product.stock <= 0) {
        errors.push(`"${item.product_name}" is not available or out of stock.`);
        continue;
      }

      const existingItem = await getCartItemByProductId(cart.id, item.product_id);
      const alreadyInCart = existingItem ? existingItem.quantity : 0;
      const availableToAdd = product.stock - alreadyInCart;

      if (availableToAdd <= 0) {
        errors.push(`"${product.name}" is already in your cart at maximum available quantity.`);
        continue;
      }

      const qtyToAdd = Math.min(item.quantity, availableToAdd);

      if (existingItem) {
        await increaseCartItemQuantity(existingItem.id, qtyToAdd);
      } else {
        await addCartItem(cart.id, item.product_id, qtyToAdd);
      }

      totalAdded += qtyToAdd;

      if (qtyToAdd < item.quantity) {
        errors.push(`Only ${availableToAdd} unit(s) of "${product.name}" could be added because of current stock levels.`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Reorder processed. ${totalAdded} item(s) were added to your cart.`,
      data: {
        order_id: order.id,
        order_number: order.order_number,
        added_quantity: totalAdded,
        errors,
      },
    });
  } catch (error) {
    console.error("Reorder error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while processing reorder",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// VIEW CART
// GET /api/cart
// Access: dealer only
// ─────────────────────────────────────────────────────────────
const viewCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // ── 1. Get the dealer's cart ───────────────────────────
    const cart = await getCartByUserId(userId);

    // ── 2. No cart means nothing was ever added ────────────
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Your cart is empty",
        data: {
          cart_id: null,
          items: [],
          total_items: 0,
          grand_total: 0,
        },
      });
    }

    // ── 3. Fetch all items with product + category details ─
    const items = await getCartItemsWithDetails(cart.id);

    if (items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Your cart is empty",
        data: {
          cart_id: cart.id,
          items: [],
          total_items: 0,
          grand_total: 0,
        },
      });
    }

    // ── 4. Calculate grand total ───────────────────────────
    // price × quantity for each item, summed up
    const grandTotal = items.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        cart_id: cart.id,
        items,
        total_items: items.length,
        grand_total: parseFloat(grandTotal.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("View cart error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE CART ITEM QUANTITY
// PUT /api/cart/update/:itemId
// Access: dealer only
// ─────────────────────────────────────────────────────────────
const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // ── 1. Validate quantity ───────────────────────────────
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer (1 or more)",
      });
    }

    // ── 2. Find the cart item ──────────────────────────────
    const item = await getCartItemById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Cart item with ID ${itemId} not found`,
      });
    }

    // ── 3. Security: confirm this item belongs to THIS dealer's cart
    const cart = await getCartByUserId(userId);
    if (!cart || item.cart_id !== cart.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this cart item",
      });
    }

    // ── 4. Update the quantity ─────────────────────────────
    await updateCartItemQuantity(itemId, qty);

    // ── 5. Return updated cart ─────────────────────────────
    const updatedItems = await getCartItemsWithDetails(cart.id);
    const grandTotal = updatedItems.reduce(
      (sum, i) => sum + parseFloat(i.price) * i.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Cart item quantity updated",
      data: {
        cart_id: cart.id,
        items: updatedItems,
        total_items: updatedItems.length,
        grand_total: parseFloat(grandTotal.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Update cart item error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating cart item",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// REMOVE ONE ITEM FROM CART
// DELETE /api/cart/remove/:itemId
// Access: dealer only
// ─────────────────────────────────────────────────────────────
const removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    // ── 1. Find the cart item ──────────────────────────────
    const item = await getCartItemById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Cart item with ID ${itemId} not found`,
      });
    }

    // ── 2. Security: confirm item belongs to THIS dealer ──
    const cart = await getCartByUserId(userId);
    if (!cart || item.cart_id !== cart.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to remove this cart item",
      });
    }

    // ── 3. Delete the item ─────────────────────────────────
    await removeCartItem(itemId);

    // ── 4. Return remaining cart ───────────────────────────
    const remainingItems = await getCartItemsWithDetails(cart.id);
    const grandTotal = remainingItems.reduce(
      (sum, i) => sum + parseFloat(i.price) * i.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: {
        cart_id: cart.id,
        items: remainingItems,
        total_items: remainingItems.length,
        grand_total: parseFloat(grandTotal.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Remove cart item error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while removing cart item",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// CLEAR ENTIRE CART
// DELETE /api/cart/clear
// Access: dealer only
// ─────────────────────────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // ── 1. Get dealer's cart ───────────────────────────────
    const cart = await getCartByUserId(userId);
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty",
      });
    }

    // ── 2. Delete all items ────────────────────────────────
    const deletedCount = await clearCartItems(cart.id);

    return res.status(200).json({
      success: true,
      message: `Cart cleared. ${deletedCount} item(s) removed.`,
      data: {
        cart_id: cart.id,
        items: [],
        total_items: 0,
        grand_total: 0,
      },
    });
  } catch (error) {
    console.error("Clear cart error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while clearing cart",
    });
  }
};

module.exports = {
  addToCart,
  viewCart,
  reorderFromOrder,
  updateItem,
  removeItem,
  clearCart,
};
