import React, { lazy, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages - Lazy Loaded
const HomePage = lazy(() => import('../pages/home/HomePage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ProductsPage = lazy(() => import('../pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/products/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('../pages/orders/CheckoutPage'));
const OrdersPage = lazy(() => import('../pages/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/orders/OrderDetailPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AnalyticsPage = lazy(() => import('../pages/admin/AnalyticsPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('../pages/admin/AdminOrderDetailPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminPaymentsPage = lazy(() => import('../pages/admin/AdminPaymentsPage'));
const AdminDeliveriesPage = lazy(() => import('../pages/admin/AdminDeliveriesPage'));
const TravellerDashboard = lazy(() => import('../pages/traveller/TravellerDashboard'));
const TravellerDeliveryDetailPage = lazy(() => import('../pages/traveller/TravellerDeliveryDetailPage'));
const ProfilePage = lazy(() => import('../pages/auth/ProfilePage'));
const ContactPage = lazy(() => import('../pages/home/ContactPage'));
const UiDemoPage = lazy(() => import('../pages/ui/UiDemoPage'));

import PageContainer from '../components/common/PageContainer';
import PrivateRoute from './PrivateRoute';

const LoadingFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader size="lg" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PageContainer><HomePage /></PageContainer>} />
          <Route path="/login" element={<PageContainer><LoginPage /></PageContainer>} />
          <Route path="/register" element={<PageContainer><RegisterPage /></PageContainer>} />
          <Route path="/contact" element={<PageContainer><ContactPage /></PageContainer>} />
          <Route path="/ui-demo" element={<PageContainer><UiDemoPage /></PageContainer>} />
          
          {/* Dealer Protected Routes inside PublicLayout */}
          <Route element={<PrivateRoute allowedRoles={['dealer']} />}>
            <Route path="/products" element={<PageContainer><ProductsPage /></PageContainer>} />
            <Route path="/products/:id" element={<PageContainer><ProductDetailPage /></PageContainer>} />
            <Route path="/cart" element={<PageContainer><CartPage /></PageContainer>} />
            <Route path="/checkout" element={<PageContainer><CheckoutPage /></PageContainer>} />
          </Route>
          
          {/* Global Auth Routes */}
          <Route element={<PrivateRoute allowedRoles={['admin', 'dealer', 'traveller']} />}>
            <Route path="/profile" element={<PageContainer><ProfilePage /></PageContainer>} />
          </Route>
        </Route>

        {/* Admin / Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          {/* Dealer orders */}
          <Route element={<PrivateRoute allowedRoles={['dealer']} />}>
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Route>

          {/* Admin only */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/deliveries" element={<AdminDeliveriesPage />} />
          </Route>

          {/* Traveller only */}
          <Route element={<PrivateRoute allowedRoles={['traveller']} />}>
            <Route path="/traveller/dashboard" element={<TravellerDashboard />} />
            <Route path="/traveller/deliveries/:id" element={<TravellerDeliveryDetailPage />} />
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<PublicLayout><PageContainer><div className="text-center py-20">
          <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Page Not Found</h2>
          <Link to="/">
            <Button variant="primary">Go Home</Button>
          </Link>
        </div></PageContainer></PublicLayout>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
