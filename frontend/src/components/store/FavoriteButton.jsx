import { Heart } from "lucide-react";

export default function FavoriteButton({ isFavorite, onToggle, size = "sm", className = "" }) {
  const iconSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <button
      onClick={onToggle}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
      className={`rounded-lg p-2 transition ${
        isFavorite
          ? "text-[var(--color-crate)] hover:bg-[var(--color-crate)]/10"
          : "text-[var(--color-muted)] hover:bg-[var(--color-overlay)] hover:text-[var(--color-crate)]"
      } ${className}`}
    >
      <Heart className={`${iconSize} ${isFavorite ? "fill-current" : ""}`} />
    </button>
  );
}