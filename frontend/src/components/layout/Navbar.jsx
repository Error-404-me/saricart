import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-black/10 bg-[var(--color-storefront)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-xl font-extrabold text-white">
          Sari<span className="text-[var(--color-awning)]">Cart</span>
        </Link>

        <div className="flex items-center gap-4">
          {user?.role === "customer" && (
            <Link
              to="/products"
              className="hidden text-sm font-medium text-white/85 hover:text-white sm:inline"
            >
              Browse products
            </Link>
          )}
          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm text-white/80 sm:inline">
                Hi, {user.username} · <span className="capitalize">{user.role}</span>
              </span>
            )}
            <Button variant="primary" onClick={logout} className="!px-3 !py-1.5 text-sm">
              Log out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
