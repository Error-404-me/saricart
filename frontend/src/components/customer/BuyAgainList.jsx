import { Check, RotateCcw, ShoppingBag } from "lucide-react";
import { useReorder } from "../../hooks/useReorder";
import ReorderConflictModal from "./ReorderConflictModal";
import ComingSoon from "../common/ComingSoon";
import { formatCurrency } from "../../utils/formatCurrency";

export default function BuyAgainList({ items }) {
  const { reorder, conflict, dismissConflict, addedId } = useReorder();

  if (items.length === 0) {
    return (
      <ComingSoon
        icon={ShoppingBag}
        title="Nothing to buy again yet"
        description="Products you order more than once will show up here for quick reordering."
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
          {items.map((item) => {
            const justAdded = addedId === item.product_id;
            return (
              <div key={item.product_id ?? item.product_name} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--color-ink)]">{item.product_name}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Bought {item.times_purchased}×
                    {item.owner_username && ` · ${item.owner_username}'s store`}
                    {!item.available && " · currently unavailable"}
                  </p>
                </div>
                {item.available && item.current_price != null && (
                  <span className="shrink-0 text-sm text-[var(--color-muted)]">
                    {formatCurrency(item.current_price)}
                  </span>
                )}
                <button
                  onClick={() => reorder(item)}
                  disabled={!item.available}
                  aria-label={`Reorder ${item.product_name}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                    text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/10
                    disabled:cursor-not-allowed disabled:text-[var(--color-muted)] disabled:hover:bg-transparent"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {justAdded ? "Added" : "Reorder"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <ReorderConflictModal conflict={conflict} onClose={dismissConflict} />
    </>
  );
}