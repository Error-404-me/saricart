import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import Spinner from "../../components/common/Spinner";
import ComingSoon from "../../components/common/ComingSoon";
import StoreCard from "../../components/store/StoreCard";
import { fetchFavorites, removeFavorite } from "../../services/customerService";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchFavorites()
      .then(setFavorites)
      .catch(() => setError("Couldn't load your favorites. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(storeId) {
    setFavorites((prev) => prev.filter((f) => f.store_id !== storeId));
    try {
      await removeFavorite(storeId);
    } catch {
      load(); // resync if the request failed
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Favorite stores</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Stores you've saved for quick access.</p>
      </div>

      {error && (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <Spinner label="Loading your favorites…" />
      ) : favorites.length === 0 ? (
        <ComingSoon
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart on any store to save it here for quick access."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {favorites.map((fav) => (
            <StoreCard
              key={fav.store_id}
              store={{
                id: fav.store_id,
                owner_id: fav.owner_id,
                name: fav.store_name,
                status: fav.status,
                rating_average: fav.rating_average,
                rating_count: fav.rating_count,
                latitude: fav.latitude,
                longitude: fav.longitude,
              }}
              isFavorite={true}
              onToggleFavorite={() => handleRemove(fav.store_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}