import axiosInstance from './axiosInstance';

export const createOrder = async (orderData) => {
  const response = await axiosInstance.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await axiosInstance.get('/orders');
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}`);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await axiosInstance.get('/orders');
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosInstance.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const submitOrderFeedback = async (orderId, feedbackData) => {
  const response = await axiosInstance.post(`/orders/${orderId}/feedback`, feedbackData);
  return response.data;
};
