import { PackageX, ImageOff } from "lucide-react";
import ComingSoon from "../common/ComingSoon";

function agingLabel(days) {
  if (days === null || days === undefined) return "Never sold";
  return `Last sold ${days} day${days === 1 ? "" : "s"} ago`;
}

export default function SlowMovingProducts({ products }) {
  if (products.length === 0) {
    return (
      <ComingSoon
        icon={PackageX}
        title="Nothing's sitting still"
        description="Every product has sold at least once in the last 30 days."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
        {products.map((item) => (
          <div key={item.product_id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--color-paper)]">
              {item.product_image ? (
                <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
              ) : (
                <ImageOff className="h-3.5 w-3.5 text-[var(--color-muted)]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-ink)]">{item.product_name}</p>
              <p className="text-xs text-[var(--color-muted)]">{agingLabel(item.days_since_last_sale)}</p>
            </div>
            <span className="shrink-0 text-xs text-[var(--color-muted)]">{item.current_stock} in stock</span>
          </div>
        ))}
      </div>
    </div>
  );
}