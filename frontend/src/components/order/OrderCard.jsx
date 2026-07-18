import { useState } from "react";
import { Star } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import OrderStatusBadge from "./OrderStatusBadge";
import ReviewModal from "./ReviewModal";

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrderCard({ order, onReviewed }) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const canReview = order.status === "completed" && !order.review_id;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
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

      <div className="mt-4 flex items-center justify-between border-t border-dashed border-[var(--color-border)] pt-3">
        <span className="text-sm font-medium text-[var(--color-ink)]">Total</span>
        <span className="font-display text-lg font-bold text-[var(--color-storefront)]">
          {formatCurrency(order.total)}
        </span>
      </div>

      {order.status === "completed" && (
        <div className="mt-3 border-t border-[var(--color-border-subtle)] pt-3">
          {order.review_id ? (
            <p className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <Star className="h-3.5 w-3.5 fill-[var(--color-awning)] text-[var(--color-awning)]" />
              You reviewed this order
            </p>
          ) : (
            canReview && (
              <button
                onClick={() => setReviewOpen(true)}
                className="text-sm font-medium text-[var(--color-storefront)] hover:underline"
              >
                Leave a review
              </button>
            )
          )}
        </div>
      )}

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        order={order}
        onReviewed={onReviewed}
      />
    </div>
  );
}
