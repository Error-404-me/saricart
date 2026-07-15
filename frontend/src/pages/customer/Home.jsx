import { useAuth } from "../../hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-8">
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
        Welcome back, {user?.username} 👋
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Product browsing, search, and pre-orders land here in Phase 4 &amp; 5.
        For now, this page confirms your session is authenticated and
        persists across a refresh.
      </p>
    </div>
  );
}
