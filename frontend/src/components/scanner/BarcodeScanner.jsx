import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

import {
  Keyboard,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  Focus,
} from "lucide-react";

import Button from "../common/Button";
import Input from "../common/Input";

const RESCAN_COOLDOWN_MS = 1500;

/**
 * autoStart: true (default) starts the camera the moment this mounts —
 * fine when mounting itself is already the explicit action (e.g. the
 * "Scan" modal in ProductForm). Pass `false` where the component stays
 * mounted on a page the whole time it's visited (the Scanner tab), so the
 * camera + decode loop don't run — and burn battery/CPU — until someone
 * actually taps "Start camera".
 */
export default function BarcodeScanner({ onScan, autoStart = true }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const streamRef = useRef(null);
  const cancelledRef = useRef(false);

  const lastScanRef = useRef({ code: null, at: 0 });

  const [cameraState, setCameraState] = useState(
    autoStart ? "starting" : "idle",
  ); // idle | starting | running | error
  const [cameraError, setCameraError] = useState("");

  const [manualCode, setManualCode] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);

  const [scanSuccess, setScanSuccess] = useState(false);
  const scannerColor = scanSuccess ? "border-green-400" : "border-red-400";

  const releaseCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopScanner = useCallback(() => {
    cancelledRef.current = true;
    releaseCamera();
    setCameraState("idle");
  }, [releaseCamera]);

  const startScanner = useCallback(async () => {
    cancelledRef.current = false;
    setCameraState("starting");
    setCameraError("");

    try {
      const hints = new Map();

      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.ASSUME_GS1, true);

      const reader = new BrowserMultiFormatReader(hints);
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();

      if (cancelledRef.current) return;
      if (!devices.length) throw new Error("No camera found");

      // Prefer rear/mobile camera
      const camera =
        devices.find((device) =>
          /(back|rear|environment)/i.test(device.label),
        ) ?? devices[0];

      controlsRef.current = await reader.decodeFromConstraints(
        {
          video: {
            deviceId: { exact: camera.deviceId },
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            // "advanced" constraints are best-effort — browsers that don't
            // support focusMode just ignore this instead of failing.
            advanced: [{ focusMode: "continuous" }],
          },
        },
        videoRef.current,
        (result) => {
          if (cancelledRef.current || !result) return;

          const code = result.getText();
          const now = Date.now();
          const last = lastScanRef.current;

          if (code === last.code && now - last.at < RESCAN_COOLDOWN_MS) return;

          lastScanRef.current = { code, at: now };
          setScanSuccess(true);
          setTimeout(() => setScanSuccess(false), 600);
          onScan(code);
        },
      );

      if (cancelledRef.current) {
        releaseCamera();
        return;
      }

      const stream = videoRef.current?.srcObject;
      if (stream instanceof MediaStream) {
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() || {};
        if (capabilities.focusMode?.includes("continuous")) {
          await track
            .applyConstraints({ advanced: [{ focusMode: "continuous" }] })
            .catch(() => {});
        }
      }

      setCameraState("running");
    } catch (error) {
      console.error(error);
      if (!cancelledRef.current) {
        setCameraState("error");
        setCameraError(
          "Couldn't access the camera. Check permissions, try Refocus, or enter the barcode manually.",
        );
        setShowManualEntry(true);
      }
    }
  }, [onScan, releaseCamera]);

  // No standard "focus now" API exists — toggling focusMode off then back
  // to continuous is a reliable way to force a re-focus on hardware that
  // supports it. Falls back to nudging focusDistance on manual-focus-only
  // cameras (mostly laptops).
  const handleRefocus = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      const capabilities = track.getCapabilities?.() || {};
      if (capabilities.focusMode?.includes("continuous")) {
        await track
          .applyConstraints({ advanced: [{ focusMode: "manual" }] })
          .catch(() => {});
        await track.applyConstraints({
          advanced: [{ focusMode: "continuous" }],
        });
      } else if (capabilities.focusDistance) {
        const { min, max } = capabilities.focusDistance;
        await track
          .applyConstraints({ advanced: [{ focusDistance: min }] })
          .catch(() => {});
        await track
          .applyConstraints({ advanced: [{ focusDistance: max }] })
          .catch(() => {});
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Best-effort tap-to-focus (mainly Android Chrome). Falls back to the
  // general refocus nudge where the browser doesn't expose this.
  const handleVideoTap = useCallback(
    async (event) => {
      const track = streamRef.current?.getVideoTracks()[0];
      if (!track) return;

      const capabilities = track.getCapabilities?.() || {};
      if (!capabilities.pointsOfInterest) {
        handleRefocus();
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      try {
        await track.applyConstraints({
          advanced: [
            { pointsOfInterest: [{ x, y }], focusMode: "single-shot" },
          ],
        });
      } catch (error) {
        console.error(error);
      }
    },
    [handleRefocus],
  );

  useEffect(() => {
    if (autoStart) startScanner();
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleManualSubmit(event) {
    event.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    onScan(code);
    setManualCode("");
  }

  return (
    <div className="flex flex-col gap-4">
      {cameraState === "idle" ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <Camera className="h-8 w-8 text-[var(--color-muted)]" />
          <p className="text-sm text-[var(--color-muted)]">
            Camera's off. Start it when you're ready to scan.
          </p>
          <Button
            variant="secondary"
            onClick={startScanner}
            className="gap-1.5"
          >
            <Camera className="h-4 w-4" />
            Start camera
          </Button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            disablePictureInPicture
            onClick={handleVideoTap}
            className="aspect-4/3 w-full cursor-crosshair object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-black/40" />

          <div
            className={`pointer-events-none absolute left-1/2 top-1/2 h-72 w-144 -translate-x-1/2 -translate-y-1/2 rounded-none border-2 transition-colors duration-300 ${
              scanSuccess
                ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,.8)]"
                : "border-red-500 shadow-[0_0_30px_rgba(239,68,68,.8)]"
            }`}
          >
            <span
              className={`absolute left-0 top-0 h-6 w-6 border-l-4 border-t-4 ${scannerColor}`}
            />
            <span
              className={`absolute right-0 top-0 h-6 w-6 border-r-4 border-t-4 ${scannerColor}`}
            />
            <span
              className={`absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 ${scannerColor}`}
            />
            <span
              className={`absolute bottom-0 right-0 h-6 w-6 border-b-4 border-r-4 ${scannerColor}`}
            />
          </div>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
              {cameraState === "running" ? (
                scanSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    Barcode found
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 animate-pulse" />
                    Tap the frame to focus
                  </>
                )
              ) : (
                <>
                  <Camera className="h-4 w-4 animate-pulse" />
                  Starting camera...
                </>
              )}
            </div>
          </div>

          {cameraState === "running" && (
            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                onClick={handleRefocus}
                aria-label="Refocus"
                title="Refocus"
                className="rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              >
                <Focus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={stopScanner}
                aria-label="Stop camera"
                title="Stop camera"
                className="rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              >
                <CameraOff className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {cameraError && (
        <div
          role="alert"
          className="flex gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600"
        >
          <AlertTriangle className="h-4 w-4" />
          {cameraError}
        </div>
      )}

      {cameraState === "error" && (
        <Button
          variant="ghost"
          onClick={startScanner}
          className="w-fit gap-1.5"
        >
          <Camera className="h-4 w-4" />
          Try again
        </Button>
      )}

      {!showManualEntry ? (
        <button
          onClick={() => setShowManualEntry(true)}
          className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-storefront)] hover:underline"
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
            onChange={(event) => setManualCode(event.target.value)}
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
