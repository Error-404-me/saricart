import { NavLink, Outlet, Link } from "react-router-dom";
import {
  User,
  ShieldCheck,
  Bell,
  Store,
  Palette,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";

const PROFILE_TAB = {
  to: "/settings/profile",
  labelKey: "settingsTabs.profile",
  icon: User,
};
const OWNER_TAB = {
  to: "/settings/store",
  labelKey: "settingsTabs.storeProfile",
  icon: Store,
};
const REST_TABS = [
  {
    to: "/settings/security",
    labelKey: "settingsTabs.security",
    icon: ShieldCheck,
  },
  {
    to: "/settings/notifications",
    labelKey: "settingsTabs.notifications",
    icon: Bell,
  },
  {
    to: "/settings/appearance",
    labelKey: "settingsTabs.appearance",
    icon: Palette,
  },
];
const DANGER_TAB = {
  to: "/settings/danger",
  labelKey: "settingsTabs.dangerZone",
  icon: AlertTriangle,
  danger: true,
};

const SETTINGS_FOOTER_LINKS = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/refund-policy", label: "Refund Policy" },
  { to: "/delivery-policy", label: "Delivery Policy" },
];

export default function SettingsLayout() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const tabs = [
    PROFILE_TAB,
    ...(user?.role === "owner" ? [OWNER_TAB] : []),
    ...REST_TABS,
    DANGER_TAB,
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
      <nav className="lg:w-56 lg:shrink-0">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
          {t("settingsTabs.heading")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {t("settingsTabs.subheading")}
        </p>

        <ul className="mt-5 flex gap-1 overflow-x-auto pb-2 lg:mt-6 lg:flex-col lg:overflow-visible lg:pb-0">
          {tabs.map(({ to, labelKey, icon: Icon, danger }) => (
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
                {t(labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 flex-1">
        <Outlet />

        <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--color-border-subtle)] pt-6 text-xs text-[var(--color-muted)]">
          {SETTINGS_FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-[var(--color-storefront)] hover:underline"
            >
              {link.label}
            </Link>
          ))}
          <span className="ml-auto">© {new Date().getFullYear()} SariCart</span>
        </div>
      </div>
    </div>
  );
}
