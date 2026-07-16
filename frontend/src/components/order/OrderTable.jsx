import { formatCurrency } from "../../utils/formatCurrency";
import OrderStatusBadge from "./OrderStatusBadge";
import Button from "../common/Button";

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Which action buttons an owner sees for a given current status.
const ACTIONS_BY_STATUS = {
  pending: [
    { to: "accepted", label: "Accept", variant: "secondary" },
    { to: "cancelled", label: "Reject", variant: "ghost" },
  ],
  accepted: [
    { to: "preparing", label: "Start preparing", variant: "secondary" },
    { to: "cancelled", label: "Cancel", variant: "ghost" },
  ],
  preparing: [
    { to: "ready", label: "Ready for pickup", variant: "secondary" },
    { to: "cancelled", label: "Cancel", variant: "ghost" },
  ],
  ready: [{ to: "completed", label: "Mark completed", variant: "secondary" }],
  completed: [],
  cancelled: [],
};

export default function OrderTable({ orders, onStatusChange, updatingOrderId }) {
  if (orders.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const actions = ACTIONS_BY_STATUS[order.status] || [];
        const isUpdating = updatingOrderId === order.id;

        return (
          <div key={order.id} className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  Order #{order.id} · {order.customer_username}
                </p>
                <p className="text-xs text-[var(--color-muted)]">{formatDate(order.created_at)}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-ink)]">
                    {item.quantity}× {item.product_name}
                  </span>
                  <span className="text-[var(--color-muted)]">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-dashed border-black/10 pt-3">
              <span className="font-medium text-[var(--color-ink)]">
                Total: {formatCurrency(order.total)}
              </span>

              {actions.length > 0 && (
                <div className="flex gap-2">
                  {actions.map((action) => (
                    <Button
                      key={action.to}
                      variant={action.variant}
                      loading={isUpdating}
                      onClick={() => onStatusChange(order.id, action.to)}
                      className="!px-3 !py-1.5 text-sm"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
