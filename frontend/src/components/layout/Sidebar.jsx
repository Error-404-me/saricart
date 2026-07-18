import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  BarChart3,
  Settings,
  Home,
  ShoppingCart,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

const OWNER_NAV_ITEMS = [
  {
    to: "/owner/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/owner/products", label: "Products", icon: Package },
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

// Same nav shell for both roles — only which items appear differs.
export default function Sidebar({ collapsed, onToggleCollapse }) {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const navItems =
    user?.role === "owner" ? OWNER_NAV_ITEMS : CUSTOMER_NAV_ITEMS;

  return (
    <nav
      aria-label="Main navigation"
      className={`border-b border-[var(--color-border)] bg-[var(--color-surface)] transition-[width] duration-200
        md:border-b-0 md:border-r md:flex md:min-h-[calc(100vh-57px)] md:shrink-0 md:flex-col md:justify-between
        ${collapsed ? "md:w-16" : "md:w-56"}`}
    >
      <ul
        className="flex gap-1 overflow-x-auto px-3 py-2
          md:flex-col md:gap-1 md:overflow-visible md:px-3 md:py-5"
      >
        {navItems.map(({ to, label, icon: Icon, end, showCartBadge }) => (
          <li key={to} className="shrink-0">
            <NavLink
              to={to}
              end={end}
              title={label}
              className={({ isActive }) =>
                `flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition
                ${collapsed ? "md:justify-center md:px-2.5" : ""}
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

      {/* Collapse toggle: desktop only — the mobile layout is already a
          compact horizontal scroll strip, so there's nothing to collapse. */}
      <button
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden shrink-0 items-center justify-center gap-2 border-t border-[var(--color-border)] py-3 text-[var(--color-muted)]
          transition hover:bg-[var(--color-overlay)] hover:text-[var(--color-ink)] md:flex"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs font-medium">Collapse</span>
          </>
        )}
      </button>
    </nav>
  );
}
