import { PackagePlus, AlertTriangle, ImageOff } from "lucide-react";
import ComingSoon from "../common/ComingSoon";

function stockoutLabel(days) {
  if (days <= 0.5) return "Already out";
  if (days < 1.5) return "Tomorrow";
  if (days < 2.5) return "In 2 days";
  return `In ${Math.round(days)} days`;
}

export default function RestockSuggestions({ suggestions }) {
  if (suggestions.length === 0) {
    return (
      <ComingSoon
        icon={PackagePlus}
        title="Nothing urgent to restock"
        description="We'll flag products here once they're about to run out, based on recent sales."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suggestions.map((item) => (
        <div
          key={item.product_id}
          className="rounded-2xl border border-[var(--color-crate)]/25 bg-[var(--color-crate)]/5 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--color-surface)]">
              {item.product_image ? (
                <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
              ) : (
                <ImageOff className="h-4 w-4 text-[var(--color-muted)]" />
              )}
            </div>
            <p className="truncate font-medium text-[var(--color-ink)]">{item.product_name}</p>
          </div>

          <div className="mt-3.5 flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-muted)]">Current stock</span>
              <span className="font-medium text-[var(--color-ink)]">{item.current_stock}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-muted)]">Avg. daily sales</span>
              <span className="font-medium text-[var(--color-ink)]">{item.avg_daily_sales}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[var(--color-muted)]">
                <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-crate)]" />
                Expected stockout
              </span>
              <span className="font-medium text-[var(--color-crate)]">
                {stockoutLabel(item.days_until_stockout)}
              </span>
            </div>
          </div>

          <div className="mt-3.5 rounded-lg bg-[var(--color-surface)] px-3 py-2.5 text-center">
            <p className="text-xs text-[var(--color-muted)]">Suggested reorder</p>
            <p className="font-display text-lg font-bold text-[var(--color-storefront)]">
              {item.suggested_reorder} units
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}