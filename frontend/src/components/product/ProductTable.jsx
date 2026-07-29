import { Link } from "react-router-dom";
import { Pencil, Trash2, ImageOff } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatQuantity } from "../../utils/formatQuantity";

export default function ProductTable({
  products,
  onDeleteRequest,
  pendingUploads = {},
  onRetryUpload,
}) {
  if (products.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Stock</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const uploadStatus = pendingUploads[product.id];
            const isUploading = uploadStatus === "uploading";
            const uploadError =
              uploadStatus && typeof uploadStatus === "object"
                ? uploadStatus.error
                : null;

            return (
              <tr
                key={product.id}
                className="border-b border-[var(--color-border-subtle)] last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--color-paper)]">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageOff className="h-4 w-4 text-[var(--color-muted)]" />
                      )}
                      {isUploading && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-ink)]">
                        {product.name}
                      </span>
                      {product.barcode && (
                        <span className="block font-mono text-xs text-[var(--color-muted)]">
                          {product.barcode}
                        </span>
                      )}
                      {isUploading && (
                        <span className="block text-xs text-[var(--color-muted)]">
                          Uploading photo…
                        </span>
                      )}
                      {uploadError && (
                        <span className="flex items-center gap-1.5 text-xs text-[var(--color-crate)]">
                          {uploadError}
                          <button
                            type="button"
                            onClick={() => onRetryUpload?.(product.id)}
                            className="font-medium underline"
                          >
                            Retry
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)]">
                  {product.category || (
                    <span className="italic">Uncategorized</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--color-ink)]">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.stock === 0
                        ? "font-medium text-[var(--color-crate)]"
                        : product.stock <= 5
                          ? "font-medium text-[var(--color-awning-dark)]"
                          : "text-[var(--color-ink)]"
                    }
                  >
                    {formatQuantity(product.stock, product.unit)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/owner/products/edit/${product.id}`}
                      aria-label={`Edit ${product.name}`}
                      className="rounded-lg p-2 text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDeleteRequest(product)}
                      aria-label={`Delete ${product.name}`}
                      className="rounded-lg p-2 text-[var(--color-crate)] hover:bg-[var(--color-crate)]/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
