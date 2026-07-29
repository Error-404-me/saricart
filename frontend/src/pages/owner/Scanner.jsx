// frontend/src/pages/owner/Scanner.jsx
import { useCallback, useEffect, useState } from "react";
import { ScanBarcode } from "lucide-react";
import BarcodeScanner from "../../components/scanner/BarcodeScanner";
import ScanResultCard from "../../components/scanner/ScanResultCard";
import SaleCart from "../../components/scanner/SaleCart";
import SyncStatusBanner from "../../components/scanner/SyncStatusBanner";
import { useAuth } from "../../hooks/useAuth";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import {
  fetchMyProducts,
  fetchProductByBarcode,
  adjustStock,
} from "../../services/productService";
import { createWalkInSale } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  cacheCatalog,
  findCachedProductByBarcode,
  applyLocalStockDelta,
  enqueueAction,
} from "../../utils/offlineStore";

export default function Scanner() {
  const { user } = useAuth();
  const { queue, syncing, sync, refreshQueue, isOnline } = useOfflineSync();

  const [scanState, setScanState] = useState("idle"); // idle | loading | found | not-found | error
  const [scannedCode, setScannedCode] = useState("");
  const [scannedProduct, setScannedProduct] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isOnline || !user) return;
    fetchMyProducts()
      .then((products) => cacheCatalog(user.id, products))
      .catch(() => {});
  }, [isOnline, user]);

  // Scanning a product straight into the current sale is the whole point
  // of the scanner flow — no separate "Add to sale" click needed. Quantity
  // is capped at the product's stock, same as a manual add would be.
  const handleAddToSale = useCallback((product) => {
    setSaleItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: parseFloat(product.price),
          stock: product.stock,
          unit: product.unit,
          quantity: 1,
        },
      ];
    });
  }, []);

  const handleScan = useCallback(
    async (code) => {
      setScannedCode(code);
      setScanState("loading");
      setSuccessMessage("");

      if (!isOnline) {
        const cached = findCachedProductByBarcode(user.id, code);
        setScannedProduct(cached);
        setScanState(cached ? "found" : "not-found");
        if (cached) handleAddToSale(cached);
        return;
      }

      try {
        const product = await fetchProductByBarcode(code);
        setScannedProduct(product);
        setScanState("found");
        handleAddToSale(product);
      } catch (err) {
        if (err.response?.status === 404) {
          setScanState("not-found");
        } else {
          // Network dropped mid-request — fall back to the cache rather
          // than a dead end.
          const cached = findCachedProductByBarcode(user.id, code);
          if (cached) {
            setScannedProduct(cached);
            setScanState("found");
            handleAddToSale(cached);
          } else {
            setScanState("error");
            setError("Something went wrong looking up that barcode.");
          }
        }
      }
    },
    [isOnline, user, handleAddToSale],
  );

  async function handleAdjustStock(productId, delta) {
    if (!isOnline) {
      // Queue it, but reflect the change immediately — both in the
      // scan result and the cached catalog — so scanning continues to
      // make sense for the rest of this session before it's synced.
      enqueueAction({ type: "adjust_stock", productId, delta });
      applyLocalStockDelta(user.id, productId, delta);
      refreshQueue();
      setScannedProduct((prev) =>
        prev && prev.id === productId
          ? { ...prev, stock: Math.max(0, prev.stock + delta) }
          : prev,
      );
      return;
    }

    const updated = await adjustStock(productId, delta);
    if (scannedProduct?.id === productId) {
      setScannedProduct(updated);
    }
  }

  function handleUpdateQuantity(productId, quantity) {
    setSaleItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i,
      );
    });
  }

  function handleRemove(productId) {
    setSaleItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  async function handleCompleteSale() {
    setCompleting(true);
    setError("");

    if (!isOnline) {
      enqueueAction({
        type: "walk_in_sale",
        items: saleItems.map(({ productId, quantity, unit }) => ({
          productId,
          quantity,
          unit,
        })),
      });
      saleItems.forEach((item) =>
        applyLocalStockDelta(user.id, item.productId, -item.quantity),
      );
      refreshQueue();
      setSaleItems([]);
      setSuccessMessage(
        "Sale saved — it'll sync automatically once you're back online.",
      );
      setTimeout(() => setSuccessMessage(""), 5000);
      setCompleting(false);
      return;
    }

    try {
      const order = await createWalkInSale(saleItems);
      setSaleItems([]);
      setSuccessMessage(
        `Sale completed — ${formatCurrency(order.total)} total.`,
      );
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't complete the sale. Please try again.",
      );
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-[var(--color-ink)]">
          <ScanBarcode className="h-6 w-6 text-[var(--color-storefront)]" />
          Barcode scanner
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Scan to add a product to the sale, adjust its stock, or edit it. No
          keyboard needed.
        </p>
      </div>

      <SyncStatusBanner
        queue={queue}
        syncing={syncing}
        isOnline={isOnline}
        onSyncNow={sync}
      />

      {successMessage && (
        <p className="rounded-lg bg-[var(--color-storefront)]/10 px-3 py-2 text-sm text-[var(--color-storefront)]">
          {successMessage}
        </p>
      )}
      {error && (
        <p
          className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <BarcodeScanner onScan={handleScan} autoStart={false} />
          {scanState !== "idle" && (
            <ScanResultCard
              state={scanState}
              product={scannedProduct}
              scannedCode={scannedCode}
              isOffline={!isOnline}
              onAdjustStock={handleAdjustStock}
            />
          )}
        </div>

        <SaleCart
          items={saleItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemove}
          onComplete={handleCompleteSale}
          completing={completing}
          isOffline={!isOnline}
        />
      </div>
    </div>
  );
}
