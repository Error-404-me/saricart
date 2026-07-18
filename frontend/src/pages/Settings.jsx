import { Sun, Moon, User, Mail, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import Button from "../components/common/Button";
import StoreProfileSection from "../components/store/StoreProfileSection";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="rounded-lg bg-[var(--color-storefront)]/10 p-2 text-[var(--color-storefront)]">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
        <p className="text-sm font-medium text-[var(--color-ink)]">{value}</p>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Manage your account and how SariCart looks for you.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
          Account
        </h2>
        <div className="mt-1 flex flex-col divide-y divide-[var(--color-border-subtle)]">
          <InfoRow icon={User} label="Username" value={user?.username} />
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow
            icon={ShieldCheck}
            label="Account type"
            value={user?.role === "owner" ? "Store owner" : "Customer"}
          />
        </div>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Editing your profile and changing your password aren't available yet —
          they're planned for a future update.
        </p>
      </div>

      {user?.role === "owner" && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
            Store profile
          </h2>
          <div className="mt-3">
            <StoreProfileSection />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
          Appearance
        </h2>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">
              Dark mode
            </p>
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

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
          Session
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Signed in as {user?.username}. Logging out ends your session on this
          device.
        </p>
        <Button
          variant="ghost"
          onClick={logout}
          className="mt-3 gap-1.5 !text-[var(--color-crate)]"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
