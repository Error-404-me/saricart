import { PackagePlus, PackageMinus, RotateCcw, History } from "lucide-react";
import ComingSoon from "../common/ComingSoon";

const REASON_CONFIG = {
  adjustment: { label: "Manual update" },
  sale: { label: "Sold", icon: PackageMinus, tone: "text-[var(--color-crate)]" },
  cancelled: { label: "Order cancelled", icon: RotateCcw, tone: "text-[var(--color-storefront)]" },
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function StockHistoryList({ entries }) {
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
    <div className="flex flex-col divide-y divide-black/5 rounded-2xl border border-black/10 bg-white">
      {entries.map((entry) => {
        const isPositive = entry.change > 0;
        const config = REASON_CONFIG[entry.reason] || {};
        const Icon = config.icon || (isPositive ? PackagePlus : PackageMinus);

        return (
          <div key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full p-1.5 ${
                  isPositive
                    ? "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]"
                    : "bg-[var(--color-crate)]/10 text-[var(--color-crate)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">{entry.product_name}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {config.label || "Adjusted"} · {formatDate(entry.created_at)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-semibold ${
                  isPositive ? "text-[var(--color-storefront)]" : "text-[var(--color-crate)]"
                }`}
              >
                {isPositive ? "+" : ""}
                {entry.change}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                {entry.previous_stock} → {entry.new_stock}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
