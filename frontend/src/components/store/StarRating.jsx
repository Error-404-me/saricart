import { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, size = "sm", showCount, count }) {
  const [hovered, setHovered] = useState(0);
  const interactive = typeof onChange === "function";
  const displayValue = hovered || value;
  const starSize = size === "lg" ? "h-6 w-6" : "h-3.5 w-3.5";

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex items-center"
        onMouseLeave={() => interactive && setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              className={`${starSize} ${
                star <= Math.round(displayValue)
                  ? "fill-[var(--color-awning)] text-[var(--color-awning)]"
                  : "fill-transparent text-[var(--color-border)]"
              }`}
            />
          </button>
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-[var(--color-muted)]">
          {value ? value.toFixed(1) : "New"}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
}
