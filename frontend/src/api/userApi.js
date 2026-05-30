import axiosInstance from './axiosInstance';

export const getTravellers = async () => {
  const response = await axiosInstance.get('/travellers');
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await axiosInstance.get('/users', { params });
  return response.data;
};

export const activateUser = async (id) => {
  const response = await axiosInstance.patch(`/users/${id}/activate`);
  return response.data;
};

export const deactivateUser = async (id) => {
  const response = await axiosInstance.patch(`/users/${id}/deactivate`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/auth/profile', profileData);
  return response.data;
};

export const getProfile = async () => {
  const response = await axiosInstance.get('/auth/profile');
  return response.data;
};
