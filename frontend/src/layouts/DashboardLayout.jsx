import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Truck,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { cn } from '../utils/cn';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
          { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
          { name: 'All Orders', path: '/admin/orders', icon: ShoppingCart },
          { name: 'Deliveries', path: '/admin/deliveries', icon: Truck },
          { name: 'Products', path: '/admin/products', icon: Package },
          { name: 'Payments', path: '/admin/payments', icon: CreditCard },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Profile', path: '/profile', icon: Settings },
        ];
      case 'traveller':
        return [
          { name: 'Dashboard', path: '/traveller/dashboard', icon: Home },
          { name: 'Profile', path: '/profile', icon: Settings },
        ];
      case 'dealer':
      default:
        return [
          { name: 'Products', path: '/products', icon: Package },
          { name: 'My Orders', path: '/orders', icon: ShoppingCart },
          { name: 'Profile', path: '/profile', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-40 lg:hidden backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border shadow-soft flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link to="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
            PP
          </Link>
          <button
            className="lg:hidden text-text-muted hover:text-text transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 flex-1 flex flex-col space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-text-light hover:bg-surface-hover hover:text-text hover:border border-transparent"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-text-muted")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="flex w-full items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-danger hover:bg-danger/10 hover:border border-danger/30 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-surface border-b border-border shadow-sm flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-semibold text-text capitalize hidden sm:block">
              {user?.role} Panel
            </div>
          </div>

          <Link to="/profile" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-text leading-none mb-1">{user?.name}</span>
              <span className="text-xs text-text-light leading-none">{user?.email}</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-surface font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </Link>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
