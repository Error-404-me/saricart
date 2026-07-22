import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

import { Keyboard, Camera, CheckCircle2, AlertTriangle } from "lucide-react";

import Button from "../common/Button";
import Input from "../common/Input";

const RESCAN_COOLDOWN_MS = 1500;

export default function BarcodeScanner({ onScan }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  const lastScanRef = useRef({
    code: null,
    at: 0,
  });

  const [cameraState, setCameraState] = useState("starting");
  const [cameraError, setCameraError] = useState("");

  const [manualCode, setManualCode] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);

  const [scanSuccess, setScanSuccess] = useState(false);
  const scannerColor = scanSuccess ? "border-green-400" : "border-red-400";

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
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

        if (cancelled) return;

        if (!devices.length) {
          throw new Error("No camera found");
        }

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
            },
          },
          videoRef.current,
          (result) => {
            if (cancelled || !result) return;

            const code = result.getText();

            const now = Date.now();
            const last = lastScanRef.current;

            if (code === last.code && now - last.at < RESCAN_COOLDOWN_MS) {
              return;
            }

            lastScanRef.current = {
              code,
              at: now,
            };

            setScanSuccess(true);

            setTimeout(() => {
              setScanSuccess(false);
            }, 600);

            onScan(code);
          },
        );

        const stream = videoRef.current?.srcObject;

        if (stream instanceof MediaStream) {
          const track = stream.getVideoTracks()[0];

          console.log(track.getSettings());

          const capabilities = track.getCapabilities();

          if (capabilities.focusMode?.includes("continuous")) {
            await track.applyConstraints({
              advanced: [{ focusMode: "continuous" }],
            });
          }
        }

        setCameraState("running");
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setCameraState("error");
          setCameraError(
            "Couldn't access the camera. Check permissions or enter the barcode manually.",
          );
          setShowManualEntry(true);
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;

      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [onScan]);

  function handleManualSubmit(event) {
    event.preventDefault();

    const code = manualCode.trim();

    if (!code) return;

    onScan(code);

    setManualCode("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-[var(--color-border)]
          bg-black
        "
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          disablePictureInPicture
          className="aspect-4/3 w-full object-cover"
        />

        {/* Dark overlay */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-black/40
          "
        />

        {/* Scanner window */}
        <div
          className={`
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-72
            w-144
            -translate-x-1/2
            -translate-y-1/2
            rounded-none
            border-2
            transition-colors
            duration-300
            ${
              scanSuccess
                ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,.8)]"
                : "border-red-500 shadow-[0_0_30px_rgba(239,68,68,.8)]"
            }
          `}
        >
          {/* Corner guides */}
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

        {/* Status */}
        <div
          className="
            absolute
            bottom-4
            left-0
            right-0
            flex
            justify-center
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-black/60
              px-4
              py-2
              text-sm
              text-white
            "
          >
            {scanSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Barcode found
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 animate-pulse" />
                Looking for barcode...
              </>
            )}
          </div>
        </div>

        {cameraState === "starting" && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/70
              text-white
            "
          >
            <Camera className="mr-2 h-4 w-4 animate-pulse" />
            Starting camera...
          </div>
        )}
      </div>

      {cameraError && (
        <div
          role="alert"
          className="
            flex
            gap-2
            rounded-lg
            bg-red-500/10
            px-3
            py-2
            text-sm
            text-red-600
          "
        >
          <AlertTriangle className="h-4 w-4" />
          {cameraError}
        </div>
      )}

      {!showManualEntry ? (
        <button
          onClick={() => setShowManualEntry(true)}
          className="
            flex
            items-center
            justify-center
            gap-2
            text-sm
            font-medium
            text-[var(--color-storefront)]
            hover:underline
          "
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
