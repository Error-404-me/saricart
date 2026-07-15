import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * For pages like Login/Register that a logged-in user shouldn't see —
 * bounce them to their home instead.
 */
export default function PublicRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={user?.role === "owner" ? "/owner/dashboard" : "/"} replace />;
  }

  return <Outlet />;
}
