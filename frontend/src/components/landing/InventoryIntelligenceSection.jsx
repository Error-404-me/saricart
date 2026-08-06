// frontend/src/components/landing/InventoryIntelligenceSection.jsx
import {
  AlertTriangle,
  Trophy,
  TrendingUp,
  PackagePlus,
  Wallet,
} from "lucide-react";

const INSIGHTS = [
  {
    icon: AlertTriangle,
    title: "Low Stock Alerts",
    desc: "Get notified the moment a product crosses your low-stock threshold.",
  },
  {
    icon: Trophy,
    title: "Best Selling Products",
    desc: "See exactly which items your customers buy most, ranked automatically.",
  },
  {
    icon: TrendingUp,
    title: "Sales Trends",
    desc: "A day-by-day and hour-by-hour heatmap of when your store is busiest.",
  },
  {
    icon: PackagePlus,
    title: "Restocking Suggestions",
    desc: "Smart reorder amounts based on your actual recent sales velocity.",
  },
  {
    icon: Wallet,
    title: "Profit Tracking",
    desc: "Revenue, average order value, and totals — always up to date.",
  },
];

export default function InventoryIntelligenceSection() {
  return (
    <section className="bg-[var(--color-paper)] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-crate)]">
            Smart inventory insights
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            Inventory that thinks ahead
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--color-muted)]">
            Stop guessing what to restock. SariCart tells you before it becomes
            a problem.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {INSIGHTS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition duration-200 hover:shadow-lg hover:shadow-black/5"
            >
              <span className="inline-flex rounded-xl bg-[var(--color-crate)]/10 p-2.5 text-[var(--color-crate)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3.5 font-display text-sm font-bold text-[var(--color-ink)]">
                {title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
