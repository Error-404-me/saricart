import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ImageOff, ShoppingCart } from "lucide-react";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { formatCurrency } from "../../utils/formatCurrency";
import { fetchProduct } from "../../services/productService";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-black/10 bg-[var(--color-paper)]">
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
              <span className="w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
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

            <Button
              variant="primary"
              disabled
              title="Pre-ordering arrives in Phase 6"
              className="mt-2 w-full gap-1.5 sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </Button>
            <p className="text-xs text-[var(--color-muted)]">
              Cart and pre-ordering are coming in Phase 6.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
