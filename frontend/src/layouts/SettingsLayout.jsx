import { NavLink, Outlet } from "react-router-dom";
import { User, ShieldCheck, Bell, Store, Palette, AlertTriangle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const PROFILE_TAB = { to: "/settings/profile", label: "Profile", icon: User };
const OWNER_TAB = { to: "/settings/store", label: "Store profile", icon: Store };
const REST_TABS = [
  { to: "/settings/security", label: "Security", icon: ShieldCheck },
  { to: "/settings/notifications", label: "Notifications", icon: Bell },
  { to: "/settings/appearance", label: "Appearance", icon: Palette },
];
const DANGER_TAB = { to: "/settings/danger", label: "Danger zone", icon: AlertTriangle, danger: true };

export default function SettingsLayout() {
  const { user } = useAuth();

  const tabs = [
    PROFILE_TAB,
    ...(user?.role === "owner" ? [OWNER_TAB] : []),
    ...REST_TABS,
    DANGER_TAB,
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
      <nav className="lg:w-56 lg:shrink-0">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Manage your account, security, and preferences.
        </p>

        <ul className="mt-5 flex gap-1 overflow-x-auto pb-2 lg:mt-6 lg:flex-col lg:overflow-visible lg:pb-0">
          {tabs.map(({ to, label, icon: Icon, danger }) => (
            <li key={to} className="shrink-0">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition
                  ${
                    danger
                      ? isActive
                        ? "bg-[var(--color-crate)]/10 text-[var(--color-crate)]"
                        : "text-[var(--color-crate)]/70 hover:bg-[var(--color-crate)]/10 hover:text-[var(--color-crate)]"
                      : isActive
                        ? "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]"
                        : "text-[var(--color-muted)] hover:bg-[var(--color-overlay)] hover:text-[var(--color-ink)]"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}