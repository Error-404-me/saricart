import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ImageOff, ShoppingCart, Minus, Plus, Check } from "lucide-react";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { formatCurrency } from "../../utils/formatCurrency";
import { fetchProduct } from "../../services/productService";
import { useCart } from "../../hooks/useCart";

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [conflict, setConflict] = useState(null); // { ownerUsername } | null

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProduct(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) setError("This product doesn't exist or has been removed.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleAddToCart(force = false) {
    const result = addItem(product, quantity, { force });
    if (result.status === "conflict") {
      setConflict({ ownerUsername: result.ownerUsername });
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <Link
        to="/products"
        className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      {loading ? (
        <Spinner label="Loading product…" />
      ) : error ? (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]">
          {error}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff className="h-10 w-10 text-[var(--color-muted)]" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {product.category && (
              <span className="w-fit rounded-full bg-[var(--color-overlay)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                {product.category}
              </span>
            )}
            <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
              {product.name}
            </h1>
            {product.owner_username && (
              <p className="text-sm text-[var(--color-muted)]">
                Sold by <span className="font-medium text-[var(--color-ink)]">{product.owner_username}</span>
              </p>
            )}
            <p className="font-display text-3xl font-bold text-[var(--color-storefront)]">
              {formatCurrency(product.price)}
            </p>

            {product.stock === 0 ? (
              <p className="text-sm font-medium text-[var(--color-crate)]">Out of stock</p>
            ) : product.stock <= 5 ? (
              <p className="text-sm font-medium text-[var(--color-awning-dark)]">
                Only {product.stock} left
              </p>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">In stock</p>
            )}

            {product.description && (
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                {product.description}
              </p>
            )}

            {product.stock > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-1.5 py-1 w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="rounded-md p-1.5 text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/10"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-medium text-[var(--color-ink)]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                  className="rounded-md p-1.5 text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <Button
              variant="primary"
              disabled={product.stock === 0}
              onClick={() => handleAddToCart(false)}
              className="mt-1 w-full gap-1.5 sm:w-auto"
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {added ? "Added to cart" : product.stock === 0 ? "Out of stock" : "Add to cart"}
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={!!conflict}
        onClose={() => setConflict(null)}
        title="Start a new cart?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConflict(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setConflict(null);
                handleAddToCart(true);
              }}
            >
              Replace cart
            </Button>
          </>
        }
      >
        <p>
          Your cart has items from <strong className="text-[var(--color-ink)]">{conflict?.ownerUsername}'s store</strong>.
          Since pickup happens at one store, adding this item will clear your current cart.
        </p>
      </Modal>
    </div>
  );
}
