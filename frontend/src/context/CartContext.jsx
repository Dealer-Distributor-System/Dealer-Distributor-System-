import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '../api/cartApi';
import useAuth from '../hooks/useAuth';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart only if user is a dealer
  useEffect(() => {
    if (isAuthenticated && user?.role === 'dealer') {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await getCart();
      const fetchedItems = res.data?.items || res.items || [];
      setCartItems(Array.isArray(fetchedItems) ? fetchedItems : []);
    } catch (error) {
      console.error('Failed to fetch cart', error);
      toast.error('Failed to load cart data.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      setLoading(true);
      await apiAddToCart({ product_id: productId, quantity });
      toast.success('Item added to cart!');
      await fetchCart(); // Refresh cart to get the actual cart item ID from backend
    } catch (error) {
      console.error('Failed to add to cart', error);
      const message = error?.response?.data?.message || error?.message;
      toast.error(message || 'Could not add item to cart.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return;
    try {
      // Optimistic update
      setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
      await apiUpdateCartItem(cartItemId, quantity);
    } catch (error) {
      console.error('Failed to update quantity', error);
      toast.error('Failed to update quantity.');
      await fetchCart(); // Revert optimistic update on failure
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      // Optimistic update
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      await apiRemoveCartItem(cartItemId);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item', error);
      toast.error('Failed to remove item.');
      await fetchCart(); // Revert on failure
    }
  };

  const clearCart = async () => {
    try {
      setCartItems([]);
      await apiClearCart();
    } catch (error) {
      console.error('Failed to clear cart', error);
      toast.error('Failed to clear cart.');
      await fetchCart();
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  const cartTotal = cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
