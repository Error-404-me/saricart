// frontend/src/components/landing/PhoneMockup.jsx
import { ShoppingBag, MapPin, Star } from "lucide-react";

const PREVIEW_ITEMS = ["Corned Beef", "Coke 1.5L", "Instant Noodles"];

export default function PhoneMockup() {
  return (
    <div className="w-40 rounded-[2rem] border-4 border-[var(--color-ink)]/90 bg-[var(--color-ink)]/90 p-1.5 shadow-2xl shadow-black/20 sm:w-48">
      <div className="overflow-hidden rounded-[1.6rem] bg-[var(--color-surface)]">
        <div className="bg-[var(--color-storefront)] px-3 py-4">
          <p className="font-display text-xs font-bold text-white">Aling Nena's Store</p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/75">
            <MapPin className="h-2.5 w-2.5" />
            350m away · Open
          </p>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {PREVIEW_ITEMS.map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-lg bg-[var(--color-paper)] px-2 py-1.5"
            >
              <span className="truncate text-[10px] font-medium text-[var(--color-ink)]">
                {item}
              </span>
              <ShoppingBag className="h-3 w-3 shrink-0 text-[var(--color-storefront)]" />
            </div>
          ))}
          <div className="mt-1 flex items-center gap-1 text-[10px] text-[var(--color-awning-dark)]">
            <Star className="h-2.5 w-2.5 fill-current" />
            4.8 · 120 reviews
          </div>
        </div>
      </div>
    </div>
  );
}