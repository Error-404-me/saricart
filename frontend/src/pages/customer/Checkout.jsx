import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCurrency";
import Button from "../../components/common/Button";
import ComingSoon from "../../components/common/ComingSoon";
import { placeOrder } from "../../services/orderService";

export default function Checkout() {
  const { items, itemCount, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ComingSoon
          icon={ShoppingBag}
          title="Nothing to check out"
          description="Your cart is empty — add something from the catalog first."
        />
        <Link to="/products">
          <Button variant="secondary">Browse products</Button>
        </Link>
      </div>
    );
  }

  const storeName = `${items[0].ownerUsername}'s store`;

  async function handlePlaceOrder() {
    setSubmitting(true);
    setError("");
    try {
      const order = await placeOrder({ ownerId: items[0].ownerId, items });
      clearCart();
      navigate("/orders", { state: { justPlacedOrderId: order.id }, replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Couldn't place your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <Link
        to="/cart"
        className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cart
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Checkout</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Pickup from <span className="font-medium text-[var(--color-ink)]">{storeName}</span>
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-5">
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-ink)]">
                {item.quantity}× {item.name}
              </span>
              <span className="text-[var(--color-muted)]">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-dashed border-black/10" />

        <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
          <span>Items ({itemCount})</span>
          <span className="font-medium text-[var(--color-ink)]">{formatCurrency(subtotal)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-medium text-[var(--color-ink)]">Total</span>
          <span className="font-display text-xl font-bold text-[var(--color-storefront)]">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <p className="mt-4 rounded-lg bg-[var(--color-paper)] px-3 py-2 text-xs text-[var(--color-muted)]">
          Payment happens in person at pickup — this places a pre-order for the store to
          prepare, it doesn't charge you now.
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
            {error}
          </p>
        )}

        <Button
          variant="primary"
          loading={submitting}
          onClick={handlePlaceOrder}
          className="mt-5 w-full"
        >
          Place order
        </Button>
      </div>
    </div>
  );
}
