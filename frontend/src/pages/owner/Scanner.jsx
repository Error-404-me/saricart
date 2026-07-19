import { useCallback, useState } from "react";
import { ScanBarcode } from "lucide-react";
import BarcodeScanner from "../../components/scanner/BarcodeScanner";
import ScanResultCard from "../../components/scanner/ScanResultCard";
import SaleCart from "../../components/scanner/SaleCart";
import { fetchProductByBarcode, adjustStock } from "../../services/productService";
import { createWalkInSale } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";

export default function Scanner() {
  const [scanState, setScanState] = useState("idle"); // idle | loading | found | not-found | error
  const [scannedCode, setScannedCode] = useState("");
  const [scannedProduct, setScannedProduct] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleScan = useCallback(async (code) => {
    setScannedCode(code);
    setScanState("loading");
    setSuccessMessage("");
    try {
      const product = await fetchProductByBarcode(code);
      setScannedProduct(product);
      setScanState("found");
    } catch (err) {
      if (err.response?.status === 404) {
        setScanState("not-found");
      } else {
        setScanState("error");
        setError("Something went wrong looking up that barcode.");
      }
    }
  }, []);

  function handleAddToSale(product) {
    setSaleItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: parseFloat(product.price),
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
  }

  async function handleAdjustStock(productId, delta) {
    const updated = await adjustStock(productId, delta);
    if (scannedProduct?.id === productId) {
      setScannedProduct(updated);
    }
  }

  function handleUpdateQuantity(productId, quantity) {
    setSaleItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
      );
    });
  }

  function handleRemove(productId) {
    setSaleItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  async function handleCompleteSale() {
    setCompleting(true);
    setError("");
    try {
      const order = await createWalkInSale(saleItems);
      setSaleItems([]);
      setSuccessMessage(`Sale completed — ${formatCurrency(order.total)} total.`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't complete the sale. Please try again.");
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
          Scan to find a product, update its stock, or ring up a sale — no keyboard needed.
        </p>
      </div>

      {successMessage && (
        <p className="rounded-lg bg-[var(--color-storefront)]/10 px-3 py-2 text-sm text-[var(--color-storefront)]">
          {successMessage}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <BarcodeScanner onScan={handleScan} />
          {scanState !== "idle" && (
            <ScanResultCard
              state={scanState}
              product={scannedProduct}
              scannedCode={scannedCode}
              onAddToSale={handleAddToSale}
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
        />
      </div>
    </div>
  );
}
