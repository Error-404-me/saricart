import { Minus, Plus, Trash2, ShoppingBag, WifiOff } from "lucide-react";
import Button from "../common/Button";
import { formatCurrency } from "../../utils/formatCurrency";

export default function SaleCart({
  items,
  onUpdateQuantity,
  onRemove,
  onComplete,
  completing,
  isOffline,
}) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <ShoppingBag className="h-5 w-5 text-[var(--color-muted)]" />
        <p className="text-sm text-[var(--color-muted)]">
          Scanned items you're selling right now will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Current sale</h2>

      <div className="mt-3 flex flex-col divide-y divide-[var(--color-border-subtle)]">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-ink)]">{item.name}</p>
              <p className="text-xs text-[var(--color-muted)]">{formatCurrency(item.price)} each</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                aria-label="Decrease quantity"
                className="rounded-lg border border-[var(--color-border)] p-1 text-[var(--color-muted)] hover:bg-[var(--color-overlay)]"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-medium text-[var(--color-ink)]">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                aria-label="Increase quantity"
                className="rounded-lg border border-[var(--color-border)] p-1 text-[var(--color-muted)] hover:bg-[var(--color-overlay)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onRemove(item.productId)}
                aria-label={`Remove ${item.name}`}
                className="ml-1 rounded-lg p-1 text-[var(--color-crate)] hover:bg-[var(--color-crate)]/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-dashed border-[var(--color-border)] pt-3">
        <span className="font-medium text-[var(--color-ink)]">Total</span>
        <span className="font-display text-xl font-bold text-[var(--color-storefront)]">
          {formatCurrency(total)}
        </span>
      </div>

      <Button variant="primary" loading={completing} onClick={onComplete} className="mt-4 w-full">
        {isOffline ? "Save sale (syncs when online)" : "Complete sale"}
      </Button>
      {isOffline && (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[var(--color-muted)]">
          <WifiOff className="h-3.5 w-3.5" />
          You're offline — this sale will be saved and sent automatically once reconnected.
        </p>
      )}
    </div>
  );
}
