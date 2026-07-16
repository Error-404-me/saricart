import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Boxes } from "lucide-react";
import Spinner from "../../components/common/Spinner";
import ComingSoon from "../../components/common/ComingSoon";
import StockAdjuster from "../../components/product/StockAdjuster";
import StockHistoryList from "../../components/product/StockHistoryList";
import { fetchMyProducts, adjustStock, fetchStockHistory } from "../../services/productService";

const LOW_STOCK_THRESHOLD = 5;

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productData, historyData] = await Promise.all([
        fetchMyProducts(),
        fetchStockHistory(),
      ]);
      setProducts(productData);
      setHistory(historyData);
    } catch {
      setError("Couldn't load your inventory. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdjust(productId, delta) {
    const updated = await adjustStock(productId, delta);
    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
    fetchStockHistory().then(setHistory).catch(() => {});
  }

  const lowStockProducts = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD);

  if (loading) return <Spinner label="Loading inventory…" />;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ComingSoon
          icon={Boxes}
          title="No products to track yet"
          description="Add a product first, then come back here to manage its stock."
        />
        <Link to="/owner/products/add" className="text-sm font-medium text-[var(--color-storefront)] hover:underline">
          Add a product
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Inventory</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Update stock levels and keep an eye on what's running low.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
          {error}
        </p>
      )}

      {lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-crate)]/20 bg-[var(--color-crate)]/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-crate)]" />
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">
              {lowStockProducts.length} {lowStockProducts.length === 1 ? "item is" : "items are"} running low
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {lowStockProducts.map((p) => p.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Update stock</h2>
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                index > 0 ? "border-t border-black/5" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">{product.name}</p>
                {product.category && (
                  <p className="text-xs text-[var(--color-muted)]">{product.category}</p>
                )}
              </div>
              <StockAdjuster
                stock={product.stock}
                onAdjust={(delta) => handleAdjust(product.id, delta)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Recent activity</h2>
        <StockHistoryList entries={history} />
      </div>
    </div>
  );
}
