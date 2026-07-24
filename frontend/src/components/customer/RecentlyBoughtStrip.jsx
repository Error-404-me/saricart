import { ImageOff, RotateCcw, Check, History } from "lucide-react";
import { useReorder } from "../../hooks/useReorder";
import ReorderConflictModal from "./ReorderConflictModal";
import ComingSoon from "../common/ComingSoon";
import { formatCurrency } from "../../utils/formatCurrency";

export default function RecentlyBoughtStrip({ items }) {
  const { reorder, conflict, dismissConflict, addedId } = useReorder();

  if (items.length === 0) {
    return (
      <ComingSoon
        icon={History}
        title="No past orders yet"
        description="Products from your completed orders will show up here for one-click reordering."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => {
          const justAdded = addedId === item.product_id;
          return (
            <div
              key={item.product_id ?? item.product_name}
              className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-[var(--color-paper)]">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                ) : (
                  <ImageOff className="h-6 w-6 text-[var(--color-muted)]" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="truncate text-sm font-medium text-[var(--color-ink)]">{item.product_name}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {item.available ? formatCurrency(item.current_price) : "Unavailable"}
                </p>
                <button
                  onClick={() => reorder(item)}
                  disabled={!item.available}
                  className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-storefront)]/10 px-2.5 py-1.5 text-xs font-medium
                    text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/20
                    disabled:cursor-not-allowed disabled:bg-[var(--color-overlay)] disabled:text-[var(--color-muted)]"
                >
                  {justAdded ? <Check className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                  {justAdded ? "Added" : "Reorder"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <ReorderConflictModal conflict={conflict} onClose={dismissConflict} />
    </>
  );
}