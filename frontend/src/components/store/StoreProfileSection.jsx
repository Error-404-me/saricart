import { useEffect, useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import Input from "../common/Input";
import Button from "../common/Button";
import Spinner from "../common/Spinner";
import StoreStatusBadge from "../store/StoreStatusBadge";
import { fetchMyStore, updateMyStore } from "../../services/storeService";

export default function StoreProfileSection() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", closesAt: "", isOpen: true });
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchMyStore()
      .then((data) => {
        setStore(data);
        setForm({
          name: data.name || "",
          closesAt: data.closes_at ? data.closes_at.slice(0, 5) : "",
          isOpen: data.is_open,
        });
        setCoords({ latitude: data.latitude, longitude: data.longitude });
      })
      .catch(() => setError("Couldn't load your store profile."))
      .finally(() => setLoading(false));
  }, []);

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location access.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setError("Location access was denied.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await updateMyStore({
        name: form.name.trim() || undefined,
        latitude: coords.latitude ?? undefined,
        longitude: coords.longitude ?? undefined,
        is_open: form.isOpen,
        closes_at: form.closesAt || undefined,
      });
      setStore(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Couldn't save your store profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading store profile…" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-muted)]">
          This is what customers see when browsing nearby stores.
        </p>
        {store && <StoreStatusBadge status={store.status} />}
      </div>

      <Input
        id="store-name"
        label="Store name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        placeholder="Aling Nena's Sari-Sari Store"
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[var(--color-ink)]">
          Location
        </span>
        {coords.latitude != null ? (
          <p className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
            <MapPin className="h-4 w-4 text-[var(--color-storefront)]" />
            {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
          </p>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            Not set — customers won't find you in nearby search yet.
          </p>
        )}
        <Button
          variant="ghost"
          onClick={handleUseLocation}
          loading={locating}
          className="w-fit gap-1.5 !px-0 !py-1 text-sm"
        >
          <LocateFixed className="h-4 w-4" />
          Use my current location
        </Button>
      </div>

      <Input
        id="closes-at"
        type="time"
        label="Closes at (optional)"
        value={form.closesAt}
        onChange={(e) => setForm((f) => ({ ...f, closesAt: e.target.value }))}
      />
      <p className="-mt-2 text-xs text-[var(--color-muted)]">
        Customers see "Closing Soon" within 30 minutes of this time.
      </p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-ink)]">
            Open for orders
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            Turn off to hide your store from discovery temporarily.
          </p>
        </div>
        <button
          onClick={() => setForm((f) => ({ ...f, isOpen: !f.isOpen }))}
          role="switch"
          aria-checked={form.isOpen}
          aria-label="Toggle store open status"
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors
            ${form.isOpen ? "bg-[var(--color-storefront)]" : "bg-[var(--color-border)]"}`}
        >
          <span
            className={`absolute flex top-1 h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface)] shadow transition-transform
              ${form.isOpen ? "translate-x-6" : "translate-x-1"}`}
          ></span>
        </button>
      </div>

      {error && (
        <p
          className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
          role="alert"
        >
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-lg bg-[var(--color-storefront)]/10 px-3 py-2 text-sm text-[var(--color-storefront)]">
          Store profile saved.
        </p>
      )}

      <Button
        variant="primary"
        loading={saving}
        onClick={handleSave}
        className="w-fit"
      >
        Save store profile
      </Button>
    </div>
  );
}
