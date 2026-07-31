import {
  PackagePlus,
  PackageMinus,
  RotateCcw,
  History,
  Trash2,
} from "lucide-react";
import ComingSoon from "../common/ComingSoon";
import Button from "../common/Button";

const REASON_CONFIG = {
  adjustment: { label: "Manual update" },
  sale: {
    label: "Sold",
    icon: PackageMinus,
    tone: "text-[var(--color-crate)]",
  },
  cancelled: {
    label: "Order cancelled",
    icon: RotateCcw,
    tone: "text-[var(--color-storefront)]",
  },
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function StockHistoryList({
  entries,
  onDeleteRequest,
  deletingId,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
}) {
  if (entries.length === 0) {
    return (
      <ComingSoon
        icon={History}
        title="No stock changes yet"
        description="Restocks, sales, and manual adjustments will show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col divide-y divide-[var(--color-border-subtle)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {entries.map((entry) => {
          const isPositive = entry.change > 0;
          const config = REASON_CONFIG[entry.reason] || {};
          const Icon = config.icon || (isPositive ? PackagePlus : PackageMinus);
          const isDeleting = deletingId === entry.id;

          return (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`shrink-0 rounded-full p-1.5 ${
                    isPositive
                      ? "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]"
                      : "bg-[var(--color-crate)]/10 text-[var(--color-crate)]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-ink)]">
                    {entry.product_name}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {config.label || "Adjusted"} ·{" "}
                    {formatDate(entry.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      isPositive
                        ? "text-[var(--color-storefront)]"
                        : "text-[var(--color-crate)]"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {entry.change}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {entry.previous_stock} → {entry.new_stock}
                  </p>
                </div>

                {onDeleteRequest && (
                  <button
                    onClick={() => onDeleteRequest(entry.id)}
                    disabled={isDeleting}
                    aria-label={`Delete activity for ${entry.product_name}`}
                    title="Delete"
                    className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-crate)]/10 hover:text-[var(--color-crate)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          loading={loadingMore}
          onClick={onLoadMore}
          className="w-fit self-center !px-4 !py-2 text-sm"
        >
          Show more
        </Button>
      )}
    </div>
  );
}
