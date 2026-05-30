import axiosInstance from '../api/axiosInstance';

export const createRazorpayOrder = async (amount) => {
  try {
    const response = await axiosInstance.post('/payments/create-order', { amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post('/payments/verify', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
