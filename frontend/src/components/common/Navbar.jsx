import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';

import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="bg-surface/95 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-1">
            <Link to="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tighter mr-12 shrink-0 hover:opacity-80 transition-opacity">
              PP
            </Link>
            <Link to="/contact" className="ml-6 text-sm font-medium text-text-light hover:text-primary transition-colors hidden md:block">Contact</Link>
            {isAuthenticated && (
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'traveller' ? '/traveller/dashboard' : '/orders'}
                className="ml-6 text-sm font-bold text-primary hover:text-primary-light transition-colors hidden md:block"
              >
                Dashboard
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-6">
            {isAuthenticated && user?.role === 'dealer' && (
              <>
                <Link to="/products" className="text-sm font-medium text-text-light hover:text-primary transition-colors">Products</Link>
                <Link to="/orders" className="text-sm font-medium text-text-light hover:text-primary transition-colors">My Orders</Link>
                <Link to="/cart" className="relative p-2 text-text-light hover:text-primary transition-colors group">
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold text-white bg-danger rounded-full animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <NotificationBell />
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 pl-2 sm:pl-6 border-l border-border">
                <Link to="/profile" className="hidden sm:flex flex-col text-right hover:opacity-80 transition-opacity">
                  <span className="text-sm font-semibold text-text leading-tight">{user?.name}</span>
                  <span className="text-xs text-text-muted capitalize">{user?.role}</span>
                </Link>
                <Link to="/profile" className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-surface font-bold cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                  {user?.name?.charAt(0).toUpperCase()}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-danger hover:text-danger hover:bg-danger/10 px-3 py-1 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center pl-2 sm:pl-6 border-l border-border">
                <Link to="/login" className="text-sm font-medium text-primary hover:text-primary-light transition-colors">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
