import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * A wrapper for routes that require authentication and specific roles.
 * @param {Array} allowedRoles - e.g., ['admin', 'dealer']
 */
const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Show a loading state while fetching profile
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // If authenticated but wrong role, send them to their respective dashboard
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'traveller':
        return <Navigate to="/traveller/dashboard" replace />;
      case 'dealer':
        return <Navigate to="/products" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Authorized -> Render child routes
  return <Outlet />;
};

export default PrivateRoute;
