import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import { divIcon } from "leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import StoreStatusBadge from "./StoreStatusBadge";
import StarRating from "./StarRating";
import { directionsUrl } from "../../utils/directions";

const STATUS_COLORS = {
  open: "#123832", // --color-storefront (light mode value; markers stay legible either theme)
  closing_soon: "#D98E1F", // --color-awning-dark
  closed: "#6E7D77", // --color-muted
};

function storeIcon(status) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.closed;
  return divIcon({
    className: "",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
      background: ${color}; transform: rotate(-45deg);
      border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export default function StoreMap({ stores, center }) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl border border-[var(--color-border)] sm:h-96">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* The customer's own position */}
        <CircleMarker
          center={[center.lat, center.lng]}
          radius={8}
          pathOptions={{
            color: "white",
            weight: 2,
            fillColor: "#2563eb",
            fillOpacity: 1,
          }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>

        {stores.map((store) => (
          <Marker
            key={store.id}
            position={[store.latitude, store.longitude]}
            icon={storeIcon(store.status)}
          >
            <Popup>
              <div className="flex min-w-[160px] flex-col gap-1.5">
                <p className="font-semibold text-[var(--color-ink)]">{store.name}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {formatDistance(store.distance_km)} away
                </p>
                <StoreStatusBadge status={store.status} />
                <StarRating value={store.rating_average || 0} showCount count={store.rating_count} />
                <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                  <Link
                    to={`/products?owner=${store.owner_id}`}
                    className="font-medium text-[var(--color-storefront)] hover:underline"
                  >
                    View products →
                  </Link>
                  <a
                    href={directionsUrl(store.latitude, store.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--color-storefront)] hover:underline"
                  >
                    Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
