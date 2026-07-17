import { useCallback, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import Spinner from "../../components/common/Spinner";
import ComingSoon from "../../components/common/ComingSoon";
import OrderTable from "../../components/order/OrderTable";
import { fetchStoreOrders, updateOrderStatus } from "../../services/orderService";

const TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const load = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchStoreOrders({ status: status || undefined });
      setOrders(data);
    } catch {
      setError("Couldn't load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(statusFilter);
  }, [statusFilter, load]);

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingOrderId(orderId);
    setError("");
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        statusFilter && updated.status !== statusFilter
          ? prev.filter((o) => o.id !== orderId)
          : prev.map((o) => (o.id === orderId ? updated : o))
      );
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't update that order. Please try again.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Orders</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Review incoming pre-orders and move them through pickup.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition
              ${
                statusFilter === tab.value
                  ? "bg-[var(--color-storefront)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-overlay)]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <Spinner label="Loading orders…" />
      ) : orders.length === 0 ? (
        <ComingSoon
          icon={ClipboardList}
          title={statusFilter ? `No ${statusFilter} orders` : "No orders yet"}
          description={
            statusFilter
              ? "Try a different filter to see other orders."
              : "Orders will show up here once customers start pre-ordering."
          }
        />
      ) : (
        <OrderTable
          orders={orders}
          onStatusChange={handleStatusChange}
          updatingOrderId={updatingOrderId}
        />
      )}
    </div>
  );
}
