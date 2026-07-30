import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ImageOff,
  ShoppingCart,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatQuantity } from "../../utils/formatQuantity";
import { incrementQuantity, decrementQuantity } from "../../utils/quantity";
import { getUnitConfig } from "../../constants/units";
import {
  resolveTransactionUnit,
  getPurchaseUnitOptions,
  getMaxQuantityInUnit,
} from "../../utils/unitConversion";
import { fetchProduct } from "../../services/productService";
import { useCart } from "../../hooks/useCart";

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chosenUnit, setChosenUnit] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [conflict, setConflict] = useState(null); // { ownerUsername } | null

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setChosenUnit(data.unit);
        setQuantity(getUnitConfig(data.unit).step);
      })
      .catch(() => {
        if (!cancelled)
          setError("This product doesn't exist or has been removed.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const purchaseUnits = product ? getPurchaseUnitOptions(product) : [];
  const resolved =
    product && chosenUnit ? resolveTransactionUnit(product, chosenUnit) : null;
  const unitStepConfig = chosenUnit ? getUnitConfig(chosenUnit) : null;
  const maxInChosenUnit =
    product && chosenUnit ? getMaxQuantityInUnit(product, chosenUnit) : 0;

  function handleUnitSelect(nextUnit) {
    setChosenUnit(nextUnit);
    const cfg = getUnitConfig(nextUnit);
    const max = getMaxQuantityInUnit(product, nextUnit);
    setQuantity(Math.min(cfg.step, max || cfg.step));
  }

  function handleAddToCart(force = false) {
    const result = addItem(product, quantity, { force, unit: chosenUnit });
    if (result.status === "conflict") {
      setConflict({ ownerUsername: result.ownerUsername });
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const atMax = maxInChosenUnit > 0 && quantity >= maxInChosenUnit;
  const atMin = unitStepConfig && quantity <= unitStepConfig.step;

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
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
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
                Sold by{" "}
                <span className="font-medium text-[var(--color-ink)]">
                  {product.owner_username}
                </span>
              </p>
            )}

            {purchaseUnits.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                  Buy by
                </span>
                <div className="flex gap-2">
                  {purchaseUnits.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleUnitSelect(option.value)}
                      className={`flex flex-col items-center rounded-xl px-3.5 py-2 text-sm font-medium transition
            ${
              chosenUnit === option.value
                ? "bg-[var(--color-storefront)] text-white"
                : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-storefront)]/40"
            }`}
                    >
                      <span>{option.label}</span>
                      <span
                        className={`text-xs font-normal ${
                          chosenUnit === option.value
                            ? "text-white/80"
                            : "text-[var(--color-muted)]"
                        }`}
                      >
                        {formatCurrency(option.unitPrice)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="font-display text-3xl font-bold text-[var(--color-storefront)]">
              {resolved && formatCurrency(resolved.unitPrice)}
              <span className="ml-1.5 text-sm font-medium text-[var(--color-muted)]">
                / {getUnitConfig(chosenUnit).label}
              </span>
            </p>

            {product.stock === 0 ? (
              <p className="text-sm font-medium text-[var(--color-crate)]">
                Out of stock
              </p>
            ) : product.stock <= 5 ? (
              <p className="text-sm font-medium text-[var(--color-awning-dark)]">
                Only {formatQuantity(product.stock, product.unit)} left
              </p>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">
                {formatQuantity(product.stock, product.unit)} in stock
              </p>
            )}

            {product.description && (
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                {product.description}
              </p>
            )}

            {product.stock > 0 && chosenUnit && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-1.5 py-1 w-fit">
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        decrementQuantity(
                          q,
                          unitStepConfig.step,
                          unitStepConfig.step,
                        ),
                      )
                    }
                    disabled={atMin}
                    aria-label="Decrease quantity"
                    className="rounded-md p-1.5 text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-16 px-1 text-center text-sm font-medium text-[var(--color-ink)]">
                    {formatQuantity(quantity, chosenUnit)}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        incrementQuantity(
                          q,
                          unitStepConfig.step,
                          maxInChosenUnit,
                        ),
                      )
                    }
                    disabled={atMax}
                    aria-label="Increase quantity"
                    className="rounded-md p-1.5 text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {chosenUnit !== product.unit && (
                  <p className="text-xs text-[var(--color-muted)]">
                    Up to {formatQuantity(maxInChosenUnit, chosenUnit)}{" "}
                    available
                  </p>
                )}
              </div>
            )}

            <Button
              variant="primary"
              disabled={product.stock === 0}
              onClick={() => handleAddToCart(false)}
              className="mt-1 w-full gap-1.5 sm:w-auto"
            >
              {added ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {added
                ? "Added to cart"
                : product.stock === 0
                  ? "Out of stock"
                  : "Add to cart"}
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
          Your cart has items from{" "}
          <strong className="text-[var(--color-ink)]">
            {conflict?.ownerUsername}'s store
          </strong>
          . Since pickup happens at one store, adding this item will clear your
          current cart.
        </p>
      </Modal>
    </div>
  );
}
