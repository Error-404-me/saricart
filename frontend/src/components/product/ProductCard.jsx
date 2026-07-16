import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ProductCard({ product }) {
  const outOfStock = product.stock === 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:border-[var(--color-storefront)]/40 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-paper)]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-8 w-8 text-[var(--color-muted)]" />
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--color-ink)]/80 px-2.5 py-1 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {product.category}
          </span>
        )}
        <h3 className="font-medium leading-snug text-[var(--color-ink)]">{product.name}</h3>
        {product.owner_username && (
          <span className="text-xs text-[var(--color-muted)]">
            {product.owner_username}'s store
          </span>
        )}
        <p className="mt-auto pt-1.5 font-display text-lg font-bold text-[var(--color-storefront)]">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  );
}
