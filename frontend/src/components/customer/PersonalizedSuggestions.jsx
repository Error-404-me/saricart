import { Sparkles, Plus, Check } from "lucide-react";
import { useReorder } from "../../hooks/useReorder";
import ReorderConflictModal from "./ReorderConflictModal";
import { formatCurrency } from "../../utils/formatCurrency";

export default function PersonalizedSuggestions({ usuallyBuys, recommended }) {
  const { reorder, conflict, dismissConflict, addedId } = useReorder();

  if (usuallyBuys.length === 0 && !recommended) return null;

  function handleAddRecommended() {
    if (!recommended) return;
    reorder({
      product_id: recommended.product_id,
      product_name: recommended.product_name,
      product_image: recommended.product_image,
      owner_id: recommended.owner_id,
      owner_username: recommended.owner_username,
      current_price: recommended.price,
      current_stock: 1,
      current_unit: recommended.unit,
      available: true,
    });
  }

  const justAddedRecommended =
    recommended && addedId === recommended.product_id;

  return (
    <>
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--color-ink)]">
          <Sparkles className="h-4 w-4 text-[var(--color-awning-dark)]" />
          For you
        </h2>

        {usuallyBuys.length > 0 && (
          <div className="mt-3.5">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
              Usually buys
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {usuallyBuys.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-[var(--color-storefront)]/10 px-3 py-1 text-sm font-medium text-[var(--color-storefront)]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {recommended && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--color-paper)] p-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                Recommended
              </p>
              <p className="mt-0.5 truncate font-medium text-[var(--color-ink)]">
                {recommended.product_name}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                {recommended.reason} · {formatCurrency(recommended.price)}
              </p>
            </div>
            <button
              onClick={handleAddRecommended}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--color-storefront)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--color-storefront-light)]"
            >
              {justAddedRecommended ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {justAddedRecommended ? "Added" : "Add"}
            </button>
          </div>
        )}
      </div>
      <ReorderConflictModal conflict={conflict} onClose={dismissConflict} />
    </>
  );
}
