// frontend/src/components/landing/SocialProofSection.jsx
import { Store, Package, ClipboardList, Smile } from "lucide-react";

const TRUST_BADGES = [
  "Built for Local Businesses",
  "Inventory Management",
  "Online Ordering",
  "Sales Analytics",
];

const STATS = [
  { icon: Store, value: "1,200+", label: "Stores using SariCart" },
  { icon: Package, value: "45,000+", label: "Products managed" },
  { icon: ClipboardList, value: "80,000+", label: "Orders processed" },
  { icon: Smile, value: "97%", label: "Customer satisfaction" },
];

export default function SocialProofSection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {TRUST_BADGES.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 text-center"
            >
              <span className="mx-auto inline-flex rounded-xl bg-[var(--color-storefront)]/10 p-2.5 text-[var(--color-storefront)]">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-2xl font-bold text-[var(--color-ink)]">
                {value}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
