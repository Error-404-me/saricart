import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  BarChart3,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/owner/products", label: "Products", icon: Package },
  { to: "/owner/inventory", label: "Inventory", icon: Boxes },
  { to: "/owner/orders", label: "Orders", icon: ClipboardList },
  { to: "/owner/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/owner/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <nav
      aria-label="Store owner navigation"
      className="border-b border-black/10 bg-white
        md:w-56 md:shrink-0 md:border-b-0 md:border-r md:min-h-[calc(100vh-57px)]"
    >
      <ul
        className="flex gap-1 overflow-x-auto px-3 py-2
          md:flex-col md:gap-1 md:overflow-visible md:px-3 md:py-5"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="shrink-0">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]"
                    : "text-[var(--color-muted)] hover:bg-black/5 hover:text-[var(--color-ink)]"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
