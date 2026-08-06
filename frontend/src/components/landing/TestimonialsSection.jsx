// frontend/src/components/landing/TestimonialsSection.jsx
import { Star, User } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Nena Reyes",
    store: "Aling Nena's Sari-Sari Store",
    quote:
      "I used to close the gate not knowing what to restock. Now I see it before opening.",
  },
  {
    name: "Ramil Cruz",
    store: "Kuya Ram's Store",
    quote:
      "The barcode scanner alone saved me an hour every day during rush hour.",
  },
  {
    name: "Divina Santos",
    store: "Divina's Corner Store",
    quote:
      "Customers pre-order now, so I don't lose sales when I'm out restocking.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[var(--color-surface)] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          Loved by store owners
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6"
            >
              <div className="flex gap-0.5 text-[var(--color-awning)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]">
                "{t.quote}"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]">
                  <User className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{t.store}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
