import { useEffect, useState } from "react";
import {
  Package,
  ClipboardList,
  Wallet,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
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
  const { t, lang } = useLanguage();
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

  const lowStockCount = products.filter(
    (p) => p.stock <= LOW_STOCK_THRESHOLD,
  ).length;
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
            {t("dashboard.welcome", { name: user?.username })}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <Link to="/owner/products/add">
          <Button variant="secondary" className="gap-1.5">
            <Plus className="h-4 w-4" />
            {t("dashboard.addProduct")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label={t("dashboard.totalProducts")}
          value={loadingProducts ? "…" : products.length}
          hint={
            products.length === 0
              ? t("dashboard.hintNoProducts")
              : t("dashboard.hintInCatalog")
          }
          accent="storefront"
        />
        <StatCard
          icon={ClipboardList}
          label={t("dashboard.pendingOrders")}
          value={loadingOrders ? "…" : pendingCount}
          hint={
            pendingCount > 0
              ? t("dashboard.hintWaiting")
              : t("dashboard.hintCaughtUp")
          }
          accent="crate"
        />
        <StatCard
          icon={Wallet}
          label={t("dashboard.todaysSales")}
          value={loadingOrders ? "…" : formatCurrency(todaysSales)}
          hint={t("dashboard.hintCompletedToday")}
          accent="awning"
        />
        <StatCard
          icon={AlertTriangle}
          label={t("dashboard.lowStockAlerts")}
          value={loadingProducts ? "…" : lowStockCount}
          hint={t("dashboard.hintUnitsOrFewer", { count: LOW_STOCK_THRESHOLD })}
          accent="crate"
        />
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
            {t("dashboard.recentOrders")}
          </h2>
          {recentOrders.length > 0 && (
            <Link
              to="/owner/orders"
              className="text-sm font-medium text-[var(--color-storefront)] hover:underline"
            >
              {t("dashboard.viewAll")}
            </Link>
          )}
        </div>

        {loadingOrders ? (
          <Spinner label={t("dashboard.loadingOrders")} />
        ) : recentOrders.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl bg-[var(--color-paper)] py-10 text-center">
            <ClipboardList className="h-6 w-6 text-[var(--color-muted)]" />
            <p className="text-sm text-[var(--color-muted)]">
              {t("dashboard.noOrdersYet")}
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-[var(--color-border-subtle)]">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    {t("dashboard.orderBy", { name: order.customer_username })}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {/* Filipino doesn't inflect a countable noun for plural the
                        way English does ("3 item" reads naturally), so only
                        English needs the item/items branch here. */}
                    {order.items.length}{" "}
                    {lang === "fil"
                      ? "item"
                      : order.items.length === 1
                        ? "item"
                        : "items"}{" "}
                    · {formatCurrency(order.total)}
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
