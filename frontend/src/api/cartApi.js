import axiosInstance from './axiosInstance';

export const getCart = async () => {
  const response = await axiosInstance.get('/cart');
  return response.data;
};

export const addToCart = async (data) => {
  const response = await axiosInstance.post('/cart/add', data);
  return response.data;
};

export const updateCartItem = async (id, quantity) => {
  const response = await axiosInstance.put(`/cart/update/${id}`, { quantity });
  return response.data;
};

export const removeCartItem = async (id) => {
  const response = await axiosInstance.delete(`/cart/remove/${id}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await axiosInstance.delete('/cart/clear');
  return response.data;
};

export const reorderFromOrder = async (orderId) => {
  const response = await axiosInstance.post(`/cart/reorder/${orderId}`);
  return response.data;
};
