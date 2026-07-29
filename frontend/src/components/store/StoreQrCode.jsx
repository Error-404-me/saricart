// frontend/src/components/store/StoreQrCode.jsx (new file)
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, QrCode as QrCodeIcon } from "lucide-react";
import Button from "../common/Button";

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(name) {
  return (
    (name || "store")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "store"
  );
}

export default function StoreQrCode({ ownerId, storeName }) {
  const canvasRef = useRef(null);
  const [dataUrl, setDataUrl] = useState(null);
  const [error, setError] = useState("");

  const productsUrl = ownerId
    ? `${window.location.origin}/products?owner=${ownerId}`
    : null;

  useEffect(() => {
    if (!productsUrl || !canvasRef.current) return;
    setError("");
    setDataUrl(null);

    QRCode.toCanvas(canvasRef.current, productsUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#123832", light: "#ffffff" },
    })
      .then(() => setDataUrl(canvasRef.current.toDataURL("image/png")))
      .catch(() =>
        setError("Couldn't generate the QR code. Please try again."),
      );
  }, [productsUrl]);

  function handleDownload() {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${slugify(storeName)}-qr-code.png`;
    link.click();
  }

  function handlePrint() {
    if (!dataUrl) return;
    const printWindow = window.open("", "_blank", "width=420,height=560");
    if (!printWindow) return;

    const safeName = escapeHtml(storeName || "Scan to browse our products");
    printWindow.document.write(`
      <html>
        <head>
          <title>${safeName} — QR code</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 48px 20px; }
            img { width: 260px; height: 260px; }
            h1 { font-size: 18px; margin: 20px 0 6px; }
            p { color: #555; font-size: 13px; margin: 0; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Store QR code" />
          <h1>${safeName}</h1>
          <p>Scan with your phone camera to see what's in stock</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  if (!ownerId) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--color-ink)]">
        <QrCodeIcon className="h-4 w-4 text-[var(--color-storefront)]" />
        Store QR code
      </h2>
      <p className="text-sm text-[var(--color-muted)]">
        Print this and stick it at your counter. Scanning it takes customers
        straight to your products.
      </p>

      {error && (
        <p
          className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="flex justify-center rounded-xl bg-[var(--color-paper)] p-4">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`QR code linking to ${storeName || "your store"}'s products`}
          className="h-[240px] w-[240px]"
        />
      </div>

      <div className="flex flex-wrap flex-col m-w-[100%] gap-2 md:flex-row md:justify-end">
        <Button
          variant="secondary"
          onClick={handleDownload}
          disabled={!dataUrl}
          className="gap-1.5"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button
          variant="ghost"
          onClick={handlePrint}
          disabled={!dataUrl}
          className="gap-1.5"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  );
}
