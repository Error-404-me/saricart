import { Sun, Moon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h1 className="font-display text-xl font-bold text-[var(--color-ink)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Account preferences for {user?.username}. Password changes, notification
          preferences, and store details land here alongside later phases.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Appearance</h2>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">Dark mode</p>
            <p className="text-sm text-[var(--color-muted)]">
              Switch between a light and dark theme.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Toggle dark mode"
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors
              ${theme === "dark" ? "bg-[var(--color-storefront)]" : "bg-[var(--color-border)]"}`}
          >
            <span
              className={`absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface)] shadow transition-transform
                ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`}
            >
              {theme === "dark" ? (
                <Moon className="h-3 w-3 text-[var(--color-storefront)]" />
              ) : (
                <Sun className="h-3 w-3 text-[var(--color-awning-dark)]" />
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
