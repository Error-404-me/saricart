import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Onboarding from "./Onboarding";
import AppLayout from "../layouts/AppLayout";
import Home from "./customer/Home";

/**
 * The "/" route handles its own auth branching instead of sitting behind
 * ProtectedRoute, since guests need to see something at "/" (onboarding)
 * rather than being silently redirected to a bare login form.
 */
export default function Landing() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)]">
        <p className="text-sm text-[var(--color-muted)]">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Onboarding />;
  }

  if (user.role === "owner") {
    return <Navigate to="/owner/dashboard" replace />;
  }

  return (
    <AppLayout>
      <Home />
    </AppLayout>
  );
}
