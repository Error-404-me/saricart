import { useEffect, useState } from "react";
import { Package, ClipboardList, Wallet, AlertTriangle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import { formatCurrency } from "../../utils/formatCurrency";
import { fetchMyProducts } from "../../services/productService";
import { fetchStoreOrders } from "../../services/orderService";

const LOW_STOCK_THRESHOLD = 5;

function isToday(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMyProducts()
      .then((data) => !cancelled && setProducts(data))
      .catch(() => {})
      .finally(() => !cancelled && setLoadingProducts(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchStoreOrders()
      .then((data) => !cancelled && setOrders(data))
      .catch(() => {})
      .finally(() => !cancelled && setLoadingOrders(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const lowStockCount = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const todaysSales = orders
    .filter((o) => o.status === "completed" && isToday(o.updated_at))
    .reduce((sum, o) => sum + Number(o.total), 0);
  const recentOrders = orders.slice(0, 5);

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
          value={loadingOrders ? "…" : pendingCount}
          hint={pendingCount > 0 ? "Waiting on you to accept" : "You're all caught up"}
          accent="crate"
        />
        <StatCard
          icon={Wallet}
          label="Today's sales"
          value={loadingOrders ? "…" : formatCurrency(todaysSales)}
          hint="From orders completed today"
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

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
            Recent orders
          </h2>
          {recentOrders.length > 0 && (
            <Link
              to="/owner/orders"
              className="text-sm font-medium text-[var(--color-storefront)] hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {loadingOrders ? (
          <Spinner label="Loading recent orders…" />
        ) : recentOrders.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl bg-[var(--color-paper)] py-10 text-center">
            <ClipboardList className="h-6 w-6 text-[var(--color-muted)]" />
            <p className="text-sm text-[var(--color-muted)]">
              No orders yet — they'll show up here once customers start pre-ordering.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-[var(--color-border-subtle)]">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    Order #{order.id} · {order.customer_username}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"} ·{" "}
                    {formatCurrency(order.total)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
