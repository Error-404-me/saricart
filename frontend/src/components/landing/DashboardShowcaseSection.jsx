// frontend/src/components/landing/DashboardShowcaseSection.jsx
import { CheckCircle2 } from "lucide-react";
import DashboardPreview from "./DashboardPreview";

const POINTS = [
  "Track daily and monthly sales trends at a glance",
  "Monitor inventory levels across your entire catalog",
  "Understand which products drive your revenue",
  "Spot low-stock items before they run out",
];

export default function DashboardShowcaseSection() {
  return (
    <section className="bg-[var(--color-surface)] py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-storefront)]">
            Business insights
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            Run your store with real numbers, not guesswork
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
            SariCart gives you a live dashboard of what's actually happening in
            your store — revenue, best sellers, low stock, and pending orders —
            so every decision is backed by data.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {POINTS.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-storefront)]" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}
