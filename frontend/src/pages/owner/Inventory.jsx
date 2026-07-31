import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Boxes } from "lucide-react";
import Spinner from "../../components/common/Spinner";
import ComingSoon from "../../components/common/ComingSoon";
import StockAdjuster from "../../components/product/StockAdjuster";
import StockHistoryList from "../../components/product/StockHistoryList";
import RestockSuggestions from "../../components/product/RestockSuggestions";
import SlowMovingProducts from "../../components/product/SlowMovingProducts";
import FastestSellingProducts from "../../components/product/FastestSellingProducts";
import {
  fetchMyProducts,
  adjustStock,
  fetchStockHistory,
  deleteStockHistoryEntry,
  deleteStockHistoryEntries,
} from "../../services/productService";
import {
  fetchRestockSuggestions,
  fetchSlowMovingProducts,
  fetchFastestSelling,
} from "../../services/analyticsService";

const LOW_STOCK_THRESHOLD = 5;
const HISTORY_PAGE_SIZE = 20;

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [restockSuggestions, setRestockSuggestions] = useState([]);
  const [slowMoving, setSlowMoving] = useState([]);
  const [fastestSelling, setFastestSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        productData,
        historyData,
        restockData,
        slowMovingData,
        fastestData,
      ] = await Promise.all([
        fetchMyProducts(),
        fetchStockHistory({ limit: HISTORY_PAGE_SIZE }),
        fetchRestockSuggestions(),
        fetchSlowMovingProducts(),
        fetchFastestSelling(),
      ]);
      setProducts(productData);
      setHistory(historyData);
      setHistoryHasMore(historyData.length === HISTORY_PAGE_SIZE);
      setRestockSuggestions(restockData);
      setSlowMoving(slowMovingData);
      setFastestSelling(fastestData);
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
    fetchStockHistory({ limit: HISTORY_PAGE_SIZE })
      .then((data) => {
        setHistory(data);
        setHistoryHasMore(data.length === HISTORY_PAGE_SIZE);
      })
      .catch(() => {});
    fetchRestockSuggestions()
      .then(setRestockSuggestions)
      .catch(() => {});
  }

  async function handleLoadMoreHistory() {
    setHistoryLoadingMore(true);
    try {
      const more = await fetchStockHistory({
        limit: HISTORY_PAGE_SIZE,
        offset: history.length,
      });
      setHistory((prev) => [...prev, ...more]);
      setHistoryHasMore(more.length === HISTORY_PAGE_SIZE);
    } catch {
      setError("Couldn't load more activity. Please try again.");
    } finally {
      setHistoryLoadingMore(false);
    }
  }

  // Returns true/false so StockHistoryList knows whether to reset its
  // own select-mode state — same contract as useNotifications.
  async function handleDeleteHistoryEntry(id) {
    try {
      await deleteStockHistoryEntry(id);
      setHistory((prev) => prev.filter((entry) => entry.id !== id));
      return true;
    } catch {
      return false;
    }
  }

  async function handleBulkDeleteHistoryEntries(ids) {
    try {
      await deleteStockHistoryEntries(ids);
      const idSet = new Set(ids);
      setHistory((prev) => prev.filter((entry) => !idSet.has(entry.id)));
      return true;
    } catch {
      return false;
    }
  }

  const lowStockProducts = products.filter(
    (p) => p.stock <= LOW_STOCK_THRESHOLD,
  );

  if (loading) return <Spinner label="Loading inventory…" />;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ComingSoon
          icon={Boxes}
          title="No products to track yet"
          description="Add a product first, then come back here to manage its stock."
        />
        <Link
          to="/owner/products/add"
          className="text-sm font-medium text-[var(--color-storefront)] hover:underline"
        >
          Add a product
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Update stock levels and keep an eye on what's running low.
        </p>
      </div>

      {error && (
        <p
          className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
          role="alert"
        >
          {error}
        </p>
      )}

      {lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-crate)]/20 bg-[var(--color-crate)]/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-crate)]" />
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">
              {lowStockProducts.length}{" "}
              {lowStockProducts.length === 1 ? "item is" : "items are"} running
              low
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {lowStockProducts.map((p) => p.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
          Smart restocking
        </h2>
        <p className="-mt-1 text-sm text-[var(--color-muted)]">
          Based on the last 30 days of sales. Products expected to run out
          within a week.
        </p>
        <RestockSuggestions suggestions={restockSuggestions} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
            Slow-moving products
          </h2>
          <p className="-mt-1 text-sm text-[var(--color-muted)]">
            Unsold for the last 30 days.
          </p>
          <SlowMovingProducts products={slowMoving} />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
            Fastest selling
          </h2>
          <p className="-mt-1 text-sm text-[var(--color-muted)]">
            Top sellers over the last 30 days.
          </p>
          <FastestSellingProducts items={fastestSelling} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
          Update stock
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                index > 0 ? "border-t border-[var(--color-border-subtle)]" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  {product.name}
                </p>
                {product.category && (
                  <p className="text-xs text-[var(--color-muted)]">
                    {product.category}
                  </p>
                )}
              </div>
              <StockAdjuster
                stock={product.stock}
                unit={product.unit}
                onAdjust={(delta) => handleAdjust(product.id, delta)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
          Recent activity
        </h2>
        <StockHistoryList
          entries={history}
          onDelete={handleDeleteHistoryEntry}
          onBulkDelete={handleBulkDeleteHistoryEntries}
          hasMore={historyHasMore}
          onLoadMore={handleLoadMoreHistory}
          loadingMore={historyLoadingMore}
        />
      </div>
    </div>
  );
}
