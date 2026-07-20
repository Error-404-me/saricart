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
  Sun,
  Moon,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useTheme } from "../../hooks/useTheme";

const OWNER_NAV_ITEMS = [
  {
    to: "/owner/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/owner/products", label: "Products", icon: Package },
  { to: "/owner/scanner", label: "Scanner", icon: ScanBarcode },
  { to: "/owner/inventory", label: "Inventory", icon: Boxes },
  { to: "/owner/orders", label: "Orders", icon: ClipboardList },
  { to: "/owner/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

const CUSTOMER_NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/products", label: "Browse", icon: Package },
  { to: "/stores", label: "Nearby Stores", icon: MapPin },
  { to: "/cart", label: "Cart", icon: ShoppingCart, showCartBadge: true },
  { to: "/orders", label: "My orders", icon: ClipboardList },
  { to: "/settings", label: "Settings", icon: Settings },
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

function NavItems({ items, collapsed, itemCount }) {
  return (
    <ul className="flex gap-1 px-3 md:flex-col md:gap-1">
      {items.map(({ to, label, icon: Icon, end, showCartBadge }) => (
        <li key={to} className="shrink-0">
          <NavLink
            to={to}
            end={end}
            title={label}
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
      ))}
    </ul>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();

  const navItems =
    user?.role === "owner" ? OWNER_NAV_ITEMS : CUSTOMER_NAV_ITEMS;

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
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>

          <button
            onClick={logout}
            title="Log out"
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium
              text-[var(--color-crate)] transition
              hover:bg-[var(--color-crate)]/10
              ${collapsed ? "justify-center px-2.5" : ""}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />

            <span className={collapsed ? "hidden" : ""}>Log out</span>
          </button>
        </div>
      </nav>

      {/* Mobile */}
      <div className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)] md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            to="/"
            className="font-display text-lg font-extrabold text-[var(--color-ink)]"
          >
            Sari<span className="text-awning">Cart</span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-overlay)]"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={logout}
              aria-label="Log out"
              className="rounded-lg p-2 text-[var(--color-crate)] hover:bg-[var(--color-crate)]/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <NavItems items={navItems} collapsed={false} itemCount={itemCount} />
        </div>
      </div>
    </>
  );
}
