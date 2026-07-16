import { formatCurrency } from "../../utils/formatCurrency";
import OrderStatusBadge from "./OrderStatusBadge";

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrderCard({ order }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-[var(--color-ink)]">
            Order #{order.id} · {order.owner_username}'s store
          </p>
          <p className="text-xs text-[var(--color-muted)]">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-ink)]">
              {item.quantity}× {item.product_name}
            </span>
            <span className="text-[var(--color-muted)]">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-dashed border-black/10 pt-3">
        <span className="text-sm font-medium text-[var(--color-ink)]">Total</span>
        <span className="font-display text-lg font-bold text-[var(--color-storefront)]">
          {formatCurrency(order.total)}
        </span>
      </div>
    </div>
  );
}
