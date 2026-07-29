import { Minus, Plus, Trash2, ImageOff } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatQuantity } from "../../utils/formatQuantity";
import { getUnitConfig } from "../../constants/units";
import {
  roundToStep,
  incrementQuantity,
  decrementQuantity,
} from "../../utils/quantity";

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const unitConfig = getUnitConfig(item.unit);
  const atMax = item.quantity >= item.stock;

  function handleDecrease() {
    onUpdateQuantity(
      item.productId,
      roundToStep(item.quantity - unitConfig.step, unitConfig.step),
    );
  }

  function handleIncrease() {
    onUpdateQuantity(
      item.productId,
      incrementQuantity(item.quantity, unitConfig.step, item.stock),
    );
  }

  return (
    <div className="flex items-center gap-4 border-b border-[var(--color-border-subtle)] py-4 last:border-0">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-paper)]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageOff className="h-5 w-5 text-[var(--color-muted)]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[var(--color-ink)]">
          {item.name}
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          {formatCurrency(item.price)} per {unitConfig.label}
        </p>
        {atMax && (
          <p className="mt-0.5 text-xs text-[var(--color-awning-dark)]">
            Max available stock reached
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-1.5 py-1">
        <button
          onClick={handleDecrease}
          aria-label={`Decrease quantity of ${item.name}`}
          className="rounded-md p-1.5 text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/10"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-12 px-1 text-center text-sm font-medium text-[var(--color-ink)]">
          {formatQuantity(item.quantity, item.unit)}
        </span>
        <button
          onClick={handleIncrease}
          disabled={atMax}
          aria-label={`Increase quantity of ${item.name}`}
          className="rounded-md p-1.5 text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="w-20 shrink-0 text-right font-medium text-[var(--color-ink)]">
        {formatCurrency(item.price * item.quantity)}
      </p>

      <button
        onClick={() => onRemove(item.productId)}
        aria-label={`Remove ${item.name} from cart`}
        className="shrink-0 rounded-lg p-2 text-[var(--color-crate)] hover:bg-[var(--color-crate)]/10"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
