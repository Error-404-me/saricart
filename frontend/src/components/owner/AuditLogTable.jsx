import { Clock } from "lucide-react";

const ACTION_LABELS = {
  product_created: "Product created",
  product_updated: "Product updated",
  product_deleted: "Product deleted",
  stock_adjusted: "Stock adjusted",
  price_updated: "Price updated",
  order_status_changed: "Order status changed",
  login_success: "Logged in",
  login_failed: "Failed login attempt",
  password_changed: "Password changed",
  password_reset: "Password reset",
  account_deleted: "Account deleted",
  store_verification_submitted: "Verification submitted",
  store_verification_reviewed: "Verification reviewed",
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AuditLogTable({ entries }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center text-sm text-[var(--color-muted)]">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-muted)]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--color-ink)]">
                {ACTION_LABELS[entry.action] || entry.action}
              </p>
              {entry.description && (
                <p className="text-xs text-[var(--color-muted)]">
                  {entry.description}
                </p>
              )}
            </div>
            <span className="shrink-0 text-xs text-[var(--color-muted)]">
              {formatDate(entry.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
