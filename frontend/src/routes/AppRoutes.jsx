import { Routes, Route, Navigate } from "react-router-dom";

import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

import AppLayout from "../layouts/AppLayout";
import MainLayout from "../layouts/MainLayout";

import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";
import VerifyEmailSent from "../pages/auth/VerifyEmailSent";
import Products from "../pages/customer/Products";
import StoresNearby from "../pages/customer/StoresNearby";
import ProductDetails from "../pages/customer/ProductDetails";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import Orders from "../pages/customer/Orders";
import Dashboard from "../pages/owner/Dashboard";
import ManageProducts from "../pages/owner/ManageProducts";
import AddProduct from "../pages/owner/AddProduct";
import EditProduct from "../pages/owner/EditProduct";
import Inventory from "../pages/owner/Inventory";
import ManageOrders from "../pages/owner/ManageOrders";
import Analytics from "../pages/owner/Analytics";
import Scanner from "../pages/owner/Scanner";
import AuditLog from "../pages/owner/AuditLog";
import SettingsLayout from "../layouts/SettingsLayout";
import ProfileSettings from "../pages/settings/ProfileSettings";
import SecuritySettings from "../pages/settings/SecuritySettings";
import NotificationSettings from "../pages/settings/NotificationSettings";
import AppearanceSettings from "../pages/settings/AppearanceSettings";
import StoreSettings from "../pages/settings/StoreSettings";
import DangerZoneSettings from "../pages/settings/DangerZoneSettings";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";
import Favorites from "../pages/customer/Favorites";

import About from "../pages/About";
import Contact from "../pages/Contact";
import Privacy from "../pages/legal/Privacy";
import Terms from "../pages/legal/Terms";
import RefundPolicy from "../pages/legal/RefundPolicy";
import DeliveryPolicy from "../pages/legal/DeliveryPolicy";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Public informational/legal pages */}
      <Route element={<MainLayout />}>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/delivery-policy" element={<DeliveryPolicy />} />
      </Route>

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-email-sent" element={<VerifyEmailSent />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/products" element={<Products />} />
          <Route path="/stores" element={<StoresNearby />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route
              index
              element={<Navigate to="/settings/profile" replace />}
            />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="store" element={<StoreSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="appearance" element={<AppearanceSettings />} />
            <Route path="danger" element={<DangerZoneSettings />} />
          </Route>

          <Route element={<ProtectedRoute role="owner" />}>
            <Route path="/owner/dashboard" element={<Dashboard />} />
            <Route path="/owner/products" element={<ManageProducts />} />
            <Route path="/owner/products/add" element={<AddProduct />} />
            <Route path="/owner/products/edit/:id" element={<EditProduct />} />
            <Route path="/owner/inventory" element={<Inventory />} />
            <Route path="/owner/orders" element={<ManageOrders />} />
            <Route path="/owner/analytics" element={<Analytics />} />
            <Route path="/owner/scanner" element={<Scanner />} />
            <Route path="/owner/audit-log" element={<AuditLog />} />
          </Route>
        </Route>
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
