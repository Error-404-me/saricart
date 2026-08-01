import { Navigate } from "react-router-dom";
import { Store } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import StoreProfileSection from "../../components/store/StoreProfileSection";
import StoreVerificationSection from "../../components/store/StoreVerificationSection";

export default function StoreSettings() {
  const { user } = useAuth();
  if (user?.role !== "owner")
    return <Navigate to="/settings/profile" replace />;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--color-ink)]">
        <Store className="h-4 w-4 text-[var(--color-storefront)]" />
        Store profile
      </h2>
      <div className="mt-3">
        <StoreProfileSection />
      </div>
      <div className="mt-6">
        <StoreVerificationSection />
      </div>
    </div>
  );
}
