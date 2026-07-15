import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-8">
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
        Your store, {user?.username} 🏪
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Product management, stock, and order queues land here in Phase 3 &amp;
        4. This dashboard is owner-only — customers are redirected away from it.
      </p>
    </div>
  );
}
