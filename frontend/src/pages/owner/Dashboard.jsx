import { useEffect, useState } from "react";
import { Package, ClipboardList, Wallet, AlertTriangle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import { fetchMyProducts } from "../../services/productService";

const LOW_STOCK_THRESHOLD = 5;

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMyProducts();
        if (!cancelled) setProducts(data);
      } catch {
        // Stat cards just fall back to zero-state below; the products
        // page itself surfaces a proper error if this keeps failing.
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lowStockCount = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
            Welcome back, {user?.username} 🏪
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Here's how your store is doing today.
          </p>
        </div>
        <Link to="/owner/products/add">
          <Button variant="secondary" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total products"
          value={loadingProducts ? "…" : products.length}
          hint={products.length === 0 ? "Add your first item to get started" : "In your catalog"}
          accent="storefront"
        />
        <StatCard
          icon={ClipboardList}
          label="Pending orders"
          value="0"
          hint="Arrives once pre-orders go live"
          accent="crate"
        />
        <StatCard
          icon={Wallet}
          label="Today's sales"
          value="₱0.00"
          hint="Tracked once orders are completed"
          accent="awning"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low stock alerts"
          value={loadingProducts ? "…" : lowStockCount}
          hint={`${LOW_STOCK_THRESHOLD} units or fewer`}
          accent="crate"
        />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
          Recent orders
        </h2>
        <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl bg-[var(--color-paper)] py-10 text-center">
          <ClipboardList className="h-6 w-6 text-[var(--color-muted)]" />
          <p className="text-sm text-[var(--color-muted)]">
            No orders yet — this list fills in once customers can pre-order (Phase 7).
          </p>
        </div>
      </div>
    </div>
  );
}
