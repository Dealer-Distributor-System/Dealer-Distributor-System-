import React, { createContext, useState, useEffect, useContext } from 'react';
import useAuth from '../hooks/useAuth';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate polling for new notifications
      const interval = setInterval(() => {
        fetchNotifications();
      }, 10000); // Every 10 seconds

      fetchNotifications();
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = () => {
    // In a real app, this would be an API call
    // For now, let's simulate some context-aware notifications
    const mockNotifications = [
      { 
        id: 1, 
        title: 'New Order Placed', 
        message: 'Order #1234 has been successfully placed.', 
        time: '2 mins ago', 
        read: false,
        type: 'order'
      },
      { 
        id: 2, 
        title: 'Payment Verified', 
        message: 'Your payment for Order #1230 has been verified.', 
        time: '1 hour ago', 
        read: true,
        type: 'payment'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
export default NotificationContext;
