import { Zap } from "lucide-react";
import ComingSoon from "../common/ComingSoon";

export default function FastestSellingProducts({ items }) {
  if (items.length === 0) {
    return (
      <ComingSoon
        icon={Zap}
        title="No sales yet"
        description="Your fastest-moving products will show up here once sales come in."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
        {items.map((item) => (
          <div key={item.rank} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold
                ${
                  item.rank === 1
                    ? "bg-[var(--color-awning)]/20 text-[var(--color-awning-dark)]"
                    : "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]"
                }`}
            >
              {item.rank}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-ink)]">
              {item.product_name}
            </p>
            <span className="shrink-0 text-xs text-[var(--color-muted)]">{item.quantity_sold} sold</span>
          </div>
        ))}
      </div>
    </div>
  );
}