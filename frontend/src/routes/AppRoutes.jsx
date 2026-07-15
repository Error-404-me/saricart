import { Routes, Route, Navigate } from "react-router-dom";

import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

import MainLayout from "../layouts/MainLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/customer/Home";
import Dashboard from "../pages/owner/Dashboard";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public-only: logged-in users get redirected away from these */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Authenticated, any role */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Route>

      {/* Authenticated, owner only */}
      <Route element={<ProtectedRoute role="owner" />}>
        <Route element={<MainLayout />}>
          <Route path="/owner/dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
