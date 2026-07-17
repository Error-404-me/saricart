import { Routes, Route, Navigate } from "react-router-dom";

import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

import AppLayout from "../layouts/AppLayout";

import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Products from "../pages/customer/Products";
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
import Settings from "../pages/Settings";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root handles its own auth branching: onboarding for guests, an
          owner-dashboard redirect, or the customer home — see Landing. */}
      <Route path="/" element={<Landing />} />

      {/* Public-only: logged-in users get redirected away from these */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Authenticated, any role — shared layout (Navbar + Sidebar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<Settings />} />

          {/* Authenticated, owner only — still inside the same layout */}
          <Route element={<ProtectedRoute role="owner" />}>
            <Route path="/owner/dashboard" element={<Dashboard />} />
            <Route path="/owner/products" element={<ManageProducts />} />
            <Route path="/owner/products/add" element={<AddProduct />} />
            <Route path="/owner/products/edit/:id" element={<EditProduct />} />
            <Route path="/owner/inventory" element={<Inventory />} />
            <Route path="/owner/orders" element={<ManageOrders />} />
            <Route path="/owner/analytics" element={<Analytics />} />
          </Route>
        </Route>
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
