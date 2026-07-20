import { Link } from "react-router-dom";
import { ImageOff, Pencil, Plus, PackagePlus, ScanBarcode, WifiOff } from "lucide-react";
import Button from "../common/Button";
import StockAdjuster from "../product/StockAdjuster";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ScanResultCard({
  state,
  product,
  scannedCode,
  isOffline,
  onAddToSale,
  onAdjustStock,
}) {
  if (state === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
        <ScanBarcode className="h-4 w-4 animate-pulse" />
        Looking up {scannedCode}…
      </div>
    );
  }

  if (state === "not-found") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <span className="rounded-full bg-[var(--color-awning)]/15 p-2.5 text-[var(--color-awning-dark)]">
          <PackagePlus className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium text-[var(--color-ink)]">
            {isOffline ? "Not in your last-synced catalog" : "No product with this barcode"}
          </p>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            Scanned: <span className="font-mono">{scannedCode}</span>
          </p>
        </div>
        {isOffline ? (
          <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <WifiOff className="h-3.5 w-3.5" />
            Reconnect to check again or add a new product
          </p>
        ) : (
          <Link to={`/owner/products/add?barcode=${encodeURIComponent(scannedCode)}`}>
            <Button variant="secondary" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add this product
            </Button>
          </Link>
        )}
      </div>
    );
  }

  if (state === "found" && product) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        {isOffline && (
          <p className="mb-3 flex items-center gap-1.5 text-xs text-[var(--color-awning-dark)]">
            <WifiOff className="h-3.5 w-3.5" />
            Offline — showing your last-synced catalog
          </p>
        )}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-paper)]">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ImageOff className="h-6 w-6 text-[var(--color-muted)]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-bold text-[var(--color-ink)]">
              {product.name}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {formatCurrency(product.price)} · {product.stock} in stock
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-border-subtle)] pt-4">
          <Button
            variant="primary"
            onClick={() => onAddToSale(product)}
            disabled={product.stock === 0}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add to sale
          </Button>
          {isOffline ? (
            <Button variant="ghost" disabled title="Editing needs a connection" className="gap-1.5">
              <Pencil className="h-4 w-4" />
              Edit product
            </Button>
          ) : (
            <Link to={`/owner/products/edit/${product.id}`}>
              <Button variant="ghost" className="gap-1.5">
                <Pencil className="h-4 w-4" />
                Edit product
              </Button>
            </Link>
          )}
          <div className="ml-auto">
            <StockAdjuster
              stock={product.stock}
              onAdjust={(delta) => onAdjustStock(product.id, delta)}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
