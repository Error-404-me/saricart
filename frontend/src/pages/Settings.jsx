import { useAuth } from "../hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      <h1 className="font-display text-xl font-bold text-[var(--color-ink)]">Settings</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Account preferences for {user?.username}. Password changes, notification
        preferences, and store details land here alongside later phases.
      </p>
    </div>
  );
}
