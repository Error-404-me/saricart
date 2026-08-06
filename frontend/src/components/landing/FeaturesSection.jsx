// frontend/src/components/landing/FeaturesSection.jsx
import {
  Boxes,
  ShoppingCart,
  ScanBarcode,
  BarChart3,
  Store,
  Smartphone,
} from "lucide-react";

const FEATURES = [
  {
    icon: Boxes,
    title: "Smart Inventory Management",
    desc: "Track stock levels in real time, get low-stock alerts, and never run out of your best sellers.",
  },
  {
    icon: ShoppingCart,
    title: "Customer Pre-orders",
    desc: "Let customers reserve items online and pick them up in store — no missed sales, no wasted trips.",
  },
  {
    icon: ScanBarcode,
    title: "Barcode Scanning",
    desc: "Ring up walk-in sales and adjust stock instantly using your phone's camera — no extra hardware.",
  },
  {
    icon: BarChart3,
    title: "Sales & Analytics",
    desc: "See daily and monthly trends, best sellers, and a sales heatmap so you always know what's working.",
  },
  {
    icon: Store,
    title: "Store Management",
    desc: "Manage your profile, hours, and open/closed status, plus a printable QR code for your storefront.",
  },
  {
    icon: Smartphone,
    title: "Responsive Web App",
    desc: "Installable as an app on any device, with offline support so a sale never goes unrecorded.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20 sm:px-6"
    >
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-storefront)]">
          Everything in one place
        </span>
        <h2 className="mt-2 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          Everything you need to run your store
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--color-muted)]">
          A digital operating system for sari-sari stores — not just an ordering
          app.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-storefront)]/30 hover:shadow-lg hover:shadow-black/5"
          >
            <span className="inline-flex rounded-xl bg-[var(--color-storefront)]/10 p-3 text-[var(--color-storefront)]">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display font-bold text-[var(--color-ink)]">
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
