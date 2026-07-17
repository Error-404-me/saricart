import { Link } from "react-router-dom";
import { ShoppingCart, Sun, Moon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useTheme } from "../../hooks/useTheme";
import Button from "../common/Button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-storefront)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-xl font-extrabold text-white">
          Sari<span className="text-[var(--color-awning)]">Cart</span>
        </Link>

        <div className="flex items-center gap-4">
          {user?.role === "customer" && (
            <>
              <Link
                to="/products"
                className="hidden text-sm font-medium text-white/85 hover:text-white sm:inline"
              >
                Browse products
              </Link>
              <Link
                to="/orders"
                className="hidden text-sm font-medium text-white/85 hover:text-white sm:inline"
              >
                My orders
              </Link>
              <Link to="/cart" aria-label="Cart" className="relative rounded-lg p-1.5 text-white/90 hover:text-white">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-crate)] px-1 text-[10px] font-semibold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            </>
          )}
          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm text-white/80 sm:inline">
                Hi, {user.username} · <span className="capitalize">{user.role}</span>
              </span>
            )}
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="rounded-lg p-1.5 text-white/90 hover:bg-white/10 hover:text-white"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button variant="primary" onClick={logout} className="!px-3 !py-1.5 text-sm">
              Log out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
