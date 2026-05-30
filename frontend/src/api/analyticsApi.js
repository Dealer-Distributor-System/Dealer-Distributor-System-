import axiosInstance from './axiosInstance';

export const getAnalytics = async () => {
  const response = await axiosInstance.get('/analytics');
  return response.data;
};
