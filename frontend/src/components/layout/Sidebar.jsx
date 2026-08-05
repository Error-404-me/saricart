import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  BarChart3,
  ScanBarcode,
  Settings,
  Home,
  ShoppingCart,
  MapPin,
  Heart,
  Sun,
  Moon,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";
import NotificationBell from "../notifications/NotificationBell";
import LanguageToggle from "../common/LanguageToggle";
import ConfirmModal from "../common/ConfirmModal";

const ADMIN_NAV_ITEMS = [
  {
    to: "/admin/verifications",
    labelKey: "nav.verifications",
    icon: ShieldCheck,
    end: true,
  },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
];

const OWNER_NAV_ITEMS = [
  {
    to: "/owner/dashboard",
    labelKey: "nav.dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/owner/products", labelKey: "nav.products", icon: Package },
  { to: "/owner/scanner", labelKey: "nav.scanner", icon: ScanBarcode },
  { to: "/owner/inventory", labelKey: "nav.inventory", icon: Boxes },
  { to: "/owner/orders", labelKey: "nav.orders", icon: ClipboardList },
  { to: "/owner/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { to: "/owner/audit-log", labelKey: "nav.auditLog", icon: ShieldCheck },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
];

const CUSTOMER_NAV_ITEMS = [
  { to: "/", labelKey: "nav.home", icon: Home, end: true },
  { to: "/products", labelKey: "nav.browse", icon: Package },
  { to: "/stores", labelKey: "nav.nearbyStores", icon: MapPin },
  { to: "/favorites", labelKey: "nav.favorites", icon: Heart },
  {
    to: "/cart",
    labelKey: "nav.cart",
    icon: ShoppingCart,
    showCartBadge: true,
  },
  { to: "/orders", labelKey: "nav.myOrders", icon: ClipboardList },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
];

function Logo({ collapsed, onToggleCollapse }) {
  return (
    <div className="flex h-14 items-center justify-center border-b border-[var(--color-border)] px-2">
      {collapsed ? (
        <button
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-overlay)] hover:text-[var(--color-ink)]"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      ) : (
        <div className="flex w-full items-center justify-between">
          <Link
            to="/"
            className="font-display text-lg font-extrabold text-[var(--color-ink)]"
          >
            Sari<span className="text-awning">Cart</span>
          </Link>

          <button
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-overlay)] hover:text-[var(--color-ink)]"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

function NavItems({ items, collapsed, itemCount, onNavigate }) {
  const { t } = useLanguage();
  return (
    <ul className="flex flex-col gap-1 px-3">
      {items.map(({ to, labelKey, icon: Icon, end, showCartBadge }) => {
        const label = t(labelKey);
        return (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              title={label}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition
                ${collapsed ? "md:justify-center md:px-0" : ""}
                ${
                  isActive
                    ? "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-overlay)] hover:text-[var(--color-ink)]"
                }`
              }
            >
              <span className="relative shrink-0">
                <Icon className="h-4 w-4" />
                {showCartBadge && itemCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--color-crate)] px-1 text-[9px] font-semibold text-white">
                    {itemCount}
                  </span>
                )}
              </span>

              <span className={collapsed ? "md:hidden" : ""}>{label}</span>
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const navItems =
    user?.role === "owner"
      ? OWNER_NAV_ITEMS
      : user?.role === "admin"
        ? ADMIN_NAV_ITEMS
        : CUSTOMER_NAV_ITEMS;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  function closeMobile() {
    setMobileOpen(false);
  }

  function confirmLogout() {
    setLogoutConfirmOpen(false);
    setMobileOpen(false);
    logout();
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        aria-label="Main navigation"
        className={`hidden border-r border-[var(--color-border)] bg-[var(--color-surface)]
          transition-[width] duration-200
          md:fixed md:inset-y-0 md:left-0 md:z-20 md:flex md:flex-col
          ${collapsed ? "md:w-16" : "md:w-56"}`}
      >
        <Logo collapsed={collapsed} onToggleCollapse={onToggleCollapse} />

        <div className="flex-1 overflow-y-auto py-4">
          <NavItems
            items={navItems}
            collapsed={collapsed}
            itemCount={itemCount}
          />
        </div>

        <div className="shrink-0 border-t border-[var(--color-border)] p-3">
          <div className="mb-1">
            <NotificationBell collapsed={collapsed} />
          </div>

          <button
            onClick={toggleTheme}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium
              text-[var(--color-muted)] transition
              hover:bg-[var(--color-overlay)]
              hover:text-[var(--color-ink)]
              ${collapsed ? "justify-center px-2.5" : ""}`}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 shrink-0" />
            ) : (
              <Moon className="h-4 w-4 shrink-0" />
            )}
            <span className={collapsed ? "hidden" : ""}>
              {theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}
            </span>
          </button>

          <button
            onClick={() => setLogoutConfirmOpen(true)}
            title={t("nav.logout")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium
              text-[var(--color-crate)] transition
              hover:bg-[var(--color-crate)]/10
              ${collapsed ? "justify-center px-2.5" : ""}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={collapsed ? "hidden" : ""}>{t("nav.logout")}</span>
          </button>
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)] md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            to="/"
            className="font-display text-lg font-extrabold text-[var(--color-ink)]"
          >
            Sari<span className="text-awning">Cart</span>
          </Link>

          <div className="flex items-center gap-1">
            <LanguageToggle compact />
            <NotificationBell variant="compact" />

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-overlay)]"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 md:hidden
          ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!mobileOpen}
      >
        <div onClick={closeMobile} className="absolute inset-0 bg-black/40" />

        <nav
          aria-label="Main navigation"
          className={`absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col
            bg-[var(--color-surface)] shadow-xl shadow-black/20
            transition-transform duration-200
            ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4">
            <Link
              to="/"
              onClick={closeMobile}
              className="font-display text-lg font-extrabold text-[var(--color-ink)]"
            >
              Sari<span className="text-awning">Cart</span>
            </Link>
            <button
              onClick={closeMobile}
              aria-label="Close menu"
              className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-overlay)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <NavItems
              items={navItems}
              collapsed={false}
              itemCount={itemCount}
              onNavigate={closeMobile}
            />
          </div>

          <div className="shrink-0 border-t border-[var(--color-border)] p-3">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium
                text-[var(--color-muted)] transition hover:bg-[var(--color-overlay)] hover:text-[var(--color-ink)]"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 shrink-0" />
              ) : (
                <Moon className="h-4 w-4 shrink-0" />
              )}
              {theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}
            </button>

            <button
              onClick={() => setLogoutConfirmOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium
                text-[var(--color-crate)] transition hover:bg-[var(--color-crate)]/10"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {t("nav.logout")}
            </button>
          </div>
        </nav>
      </div>
      <ConfirmModal
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
        title={t("nav.logoutConfirmTitle")}
        confirmLabel={t("nav.logout")}
      >
        <p>{t("nav.logoutConfirmBody")}</p>
      </ConfirmModal>
    </>
  );
}
