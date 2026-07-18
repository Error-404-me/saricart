import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import Button from "../common/Button";

// Deliberately identical for both roles — role-specific navigation lives
// in the Sidebar instead, so this bar never differs between an owner and
// a customer session.
export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-border bg-storefront">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-xl font-extrabold text-white">
          Sari<span className="text-awning">Cart</span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-white/80 sm:inline">
              Hi, {user.username} ·{" "}
              <span className="capitalize">{user.role}</span>
            </span>
          )}
          <button
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="rounded-lg p-1.5 text-white/90 hover:bg-white/10 hover:text-white"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <Button
            variant="primary"
            onClick={logout}
            className="px-3 py-1.5 text-sm"
          >
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
