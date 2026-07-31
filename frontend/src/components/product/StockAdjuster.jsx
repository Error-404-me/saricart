import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { getUnitConfig } from "../../constants/units";
import { formatQuantity } from "../../utils/formatQuantity";

export default function StockAdjuster({
  stock,
  unit,
  subUnit,
  onAdjust,
  disabled,
}) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const unitConfig = getUnitConfig(unit);
  // A whole-number unit (sack, box, pack, bundle, dozen) still needs
  // decimal precision here once it's configured with a sub-unit — e.g.
  // adjusting stock by 0.98 sacks after loose kg sales.
  const allowsDecimal = unitConfig.allowsDecimal || !!subUnit;

  const parsed = parseFloat(amount);
  const isValidAmount =
    !Number.isNaN(parsed) &&
    parsed > 0 &&
    (allowsDecimal || Number.isInteger(parsed));

  async function handleAdjust(sign) {
    if (!isValidAmount) return;
    setSubmitting(true);
    setError("");
    try {
      await onAdjust(sign * parsed);
      setAmount("");
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't update stock.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={disabled || submitting || !isValidAmount}
          onClick={() => handleAdjust(-1)}
          aria-label="Remove stock"
          className="rounded-lg border border-[var(--color-border)] p-1.5 text-[var(--color-crate)] transition hover:bg-[var(--color-crate)]/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          min="0"
          step={allowsDecimal ? 0.01 : 1}
          placeholder={unitConfig.label}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled || submitting}
          className="w-20 rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-center text-sm outline-none
            focus:border-[var(--color-storefront)] focus:ring-2 focus:ring-[var(--color-storefront)]/20"
        />
        <button
          type="button"
          disabled={disabled || submitting || !isValidAmount}
          onClick={() => handleAdjust(1)}
          aria-label="Add stock"
          className="rounded-lg border border-[var(--color-border)] p-1.5 text-[var(--color-storefront)] transition hover:bg-[var(--color-storefront)]/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <span className="ml-1 text-xs text-[var(--color-muted)]">
          {formatQuantity(stock, unit)} in stock
        </span>
      </div>
      {error && <p className="text-xs text-[var(--color-crate)]">{error}</p>}
    </div>
  );
}
