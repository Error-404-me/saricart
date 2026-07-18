import { useCallback, useState } from "react";
import { MapPin, LocateFixed, Store as StoreIcon } from "lucide-react";
import Spinner from "../../components/common/Spinner";
import ComingSoon from "../../components/common/ComingSoon";
import Button from "../../components/common/Button";
import StoreCard from "../../components/store/StoreCard";
import { fetchNearbyStores } from "../../services/storeService";

const RADIUS_OPTIONS = [
  { value: 2, label: "2km" },
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 25, label: "25km" },
];

export default function StoresNearby() {
  const [status, setStatus] = useState("idle"); // idle | locating | loading | ready | error
  const [stores, setStores] = useState([]);
  const [radiusKm, setRadiusKm] = useState(10);
  const [error, setError] = useState("");

  const locateAndSearch = useCallback((radius) => {
    if (!navigator.geolocation) {
      setStatus("error");
      setError("Your browser doesn't support location access.");
      return;
    }

    setStatus("locating");
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus("loading");
        try {
          const data = await fetchNearbyStores({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radiusKm: radius,
          });
          setStores(data);
          setStatus("ready");
        } catch {
          setError("Couldn't load nearby stores. Please try again.");
          setStatus("error");
        }
      },
      () => {
        setError("Location access was denied. Enable it in your browser to find nearby stores.");
        setStatus("error");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  function handleRadiusChange(value) {
    setRadiusKm(value);
    if (status === "ready" || status === "error") {
      locateAndSearch(value);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
          Stores nearby
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Discover participating sari-sari stores close to you.
        </p>
      </div>

      {status !== "idle" && (
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleRadiusChange(opt.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition
                ${
                  radiusKm === opt.value
                    ? "bg-[var(--color-storefront)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-overlay)]"
                }`}
            >
              Within {opt.label}
            </button>
          ))}
        </div>
      )}

      {status === "idle" && (
        <div className="flex flex-col items-center gap-4">
          <ComingSoon
            icon={MapPin}
            title="Find stores near you"
            description="We'll use your device's location to show participating stores close by."
          />
          <Button variant="secondary" onClick={() => locateAndSearch(radiusKm)} className="gap-1.5">
            <LocateFixed className="h-4 w-4" />
            Use my location
          </Button>
        </div>
      )}

      {status === "locating" && <Spinner label="Getting your location…" />}
      {status === "loading" && <Spinner label="Finding stores nearby…" />}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4">
          <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
            {error}
          </p>
          <Button variant="secondary" onClick={() => locateAndSearch(radiusKm)} className="gap-1.5">
            <LocateFixed className="h-4 w-4" />
            Try again
          </Button>
        </div>
      )}

      {status === "ready" &&
        (stores.length === 0 ? (
          <ComingSoon
            icon={StoreIcon}
            title="No stores in range"
            description="Try widening your search radius above."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ))}
    </div>
  );
}
