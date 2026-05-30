import axiosInstance from './axiosInstance';

export const getPayments = async () => {
  const response = await axiosInstance.get('/payments');
  return response.data;
};

export const verifyPayment = async (id) => {
  const response = await axiosInstance.put(`/payments/${id}/verify`);
  return response.data;
};

export const rejectPayment = async (id, remark) => {
  const response = await axiosInstance.put(`/payments/${id}/reject`, { remark });
  return response.data;
};
