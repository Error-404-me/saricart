import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Keyboard, Camera } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";

const SCAN_REGION_ID = "saricart-barcode-scanner";
const RESCAN_COOLDOWN_MS = 1500;

/**
 * Camera-based barcode scanner with a manual-entry fallback — not every
 * device has a usable camera (or grants permission), and typing a code
 * should always work as a backup.
 *
 * html5-qrcode's start()/stop() are both async, and React 18 StrictMode
 * intentionally double-invokes effects in development (mount → cleanup →
 * mount again) to surface exactly this kind of bug: without care, a second
 * start() can fire before the first stop() has actually released the
 * camera, and the library throws. operationChainRef serializes every
 * start/stop through one promise queue — persisted in a ref so it survives
 * across that double-invoke — so a new start always waits for the previous
 * stop to fully finish first.
 */
export default function BarcodeScanner({ onScan }) {
  const lastScanRef = useRef({ code: null, at: 0 });
  const operationChainRef = useRef(Promise.resolve());
  const [cameraState, setCameraState] = useState("starting"); // starting | running | error
  const [cameraError, setCameraError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(SCAN_REGION_ID, { verbose: false });

    setCameraState("starting");
    setCameraError("");

    operationChainRef.current = operationChainRef.current
      .catch(() => {})
      .then(() =>
        scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            const now = Date.now();
            const last = lastScanRef.current;
            // Ignore the same code firing again within the cooldown window —
            // the camera decodes several frames a second while a barcode
            // sits in view, so without this a single scan fires repeatedly.
            if (decodedText === last.code && now - last.at < RESCAN_COOLDOWN_MS) return;
            lastScanRef.current = { code: decodedText, at: now };
            onScan(decodedText);
          },
          () => {
            // Per-frame "nothing decoded yet" callback — expected constantly
            // while aiming the camera, not a real error.
          }
        )
      )
      .then(() => {
        if (cancelled) {
          // Unmounted (or StrictMode's simulated cleanup fired) while the
          // camera was still starting — shut it back down immediately.
          return scanner.stop().then(() => scanner.clear());
        }
        setCameraState("running");
      })
      .catch(() => {
        if (!cancelled) {
          setCameraState("error");
          setCameraError("Couldn't access the camera. Check permissions, or enter the code below.");
          setShowManualEntry(true);
        }
      });

    return () => {
      cancelled = true;
      operationChainRef.current = operationChainRef.current
        .then(() => scanner.stop().then(() => scanner.clear()))
        .catch(() => {});
    };
  }, [onScan]);

  function handleManualSubmit(e) {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    onScan(code);
    setManualCode("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black">
        <div id={SCAN_REGION_ID} className="aspect-[4/3] w-full [&_video]:!h-full [&_video]:!w-full [&_video]:object-cover" />
        {cameraState === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white">
            <Camera className="mr-2 h-4 w-4 animate-pulse" />
            Starting camera…
          </div>
        )}
      </div>

      {cameraError && (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
          {cameraError}
        </p>
      )}

      {!showManualEntry ? (
        <button
          onClick={() => setShowManualEntry(true)}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--color-storefront)] hover:underline"
        >
          <Keyboard className="h-4 w-4" />
          Enter barcode manually instead
        </button>
      ) : (
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <Input
            id="manual-barcode"
            label="Barcode"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="e.g. 4801988712345"
            className="flex-1"
          />
          <Button type="submit" variant="secondary" className="mt-6 h-fit">
            Look up
          </Button>
        </form>
      )}
    </div>
  );
}
