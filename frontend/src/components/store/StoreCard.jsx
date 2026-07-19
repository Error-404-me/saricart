import { Link } from "react-router-dom";
import { ChevronRight, Navigation, Store as StoreIcon } from "lucide-react";
import StoreStatusBadge from "./StoreStatusBadge";
import StarRating from "./StarRating";
import { directionsUrl } from "../../utils/directions";

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export default function StoreCard({ store }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]">
        <StoreIcon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-medium text-[var(--color-muted)]">
            {formatDistance(store.distance_km)}
          </span>
          <span className="text-[var(--color-border)]">·</span>
          <h3 className="truncate font-display font-bold text-[var(--color-ink)]">
            {store.name}
          </h3>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <StoreStatusBadge status={store.status} />
          <StarRating value={store.rating_average || 0} showCount count={store.rating_count} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {store.latitude != null && (
          <a
            href={directionsUrl(store.latitude, store.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Get directions to ${store.name}`}
            title="Get directions"
            className="rounded-lg p-2 text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/10"
          >
            <Navigation className="h-4 w-4" />
          </a>
        )}
        <Link
          to={`/products?owner=${store.owner_id}`}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/10"
        >
          Products
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
