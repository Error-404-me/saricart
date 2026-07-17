import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";
import Button from "../common/Button";

export default function CartSummary({ itemCount, subtotal, storeName }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Order summary</h2>

      {storeName && (
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Pickup from <span className="font-medium text-[var(--color-ink)]">{storeName}</span>
        </p>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-muted)]">
        <span>
          Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
        <span className="font-medium text-[var(--color-ink)]">{formatCurrency(subtotal)}</span>
      </div>

      <div className="my-4 border-t border-dashed border-[var(--color-border)]" />

      <div className="flex items-center justify-between">
        <span className="font-medium text-[var(--color-ink)]">Total</span>
        <span className="font-display text-xl font-bold text-[var(--color-storefront)]">
          {formatCurrency(subtotal)}
        </span>
      </div>

      <Link to="/checkout">
        <Button variant="primary" className="mt-5 w-full">
          Proceed to checkout
        </Button>
      </Link>
    </div>
  );
}
