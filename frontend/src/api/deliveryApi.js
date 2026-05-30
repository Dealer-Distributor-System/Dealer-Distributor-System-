import axiosInstance from './axiosInstance';

export const getDeliveries = async () => {
  const response = await axiosInstance.get('/deliveries');
  return response.data;
};

export const getDeliveryDetail = async (id) => {
  const response = await axiosInstance.get(`/deliveries/${id}`);
  return response.data;
};

export const assignDelivery = async (orderId, travellerId) => {
  const response = await axiosInstance.post('/deliveries/assign', { 
    order_id: orderId, 
    traveller_id: travellerId 
  });
  return response.data;
};

export const acceptDelivery = async (id) => {
  const response = await axiosInstance.put(`/deliveries/${id}/accept`);
  return response.data;
};

export const updateDeliveryStatus = async (id, { status, location, remark }) => {
  const response = await axiosInstance.post(`/deliveries/${id}/update-status`, { 
    status, 
    location, 
    remark 
  });
  return response.data;
};

export const getDeliveryTracking = async (id) => {
  const response = await axiosInstance.get(`/deliveries/${id}/tracking`);
  return response.data;
};

export const getOrderTracking = async (orderId) => {
  const response = await axiosInstance.get(`/deliveries/tracking/${orderId}`);
  return response.data;
};
