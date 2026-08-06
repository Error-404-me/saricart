// frontend/src/components/landing/DashboardPreview.jsx
import { TrendingUp, Package, ClipboardList, AlertTriangle } from "lucide-react";

const REVENUE_BARS = [40, 65, 50, 80, 60, 95, 75];
const BEST_SELLERS = [
  { name: "Lucky Me Pancit Canton", sold: 128 },
  { name: "Coke 1.5L", sold: 96 },
  { name: "Argentina Corned Beef", sold: 74 },
];
const LOW_STOCK = [
  { name: "Kopiko Brown 3-in-1", stock: 3 },
  { name: "Safeguard Soap", stock: 5 },
];
const RECENT_TRANSACTIONS = [
  { label: "Walk-in sale · Coke 1.5L ×2", amount: "₱90.00" },
  { label: "Pre-order · Maria S.", amount: "₱215.00" },
  { label: "Walk-in sale · Pancit Canton ×5", amount: "₱75.00" },
];
const PENDING_ORDERS = 7;
const TOTAL_PRODUCTS = 142;
const TODAY_REVENUE = "₱4,820";

function Chip({ icon: Icon, label, accent = "storefront" }) {
  const accentClasses =
    accent === "crate"
      ? "bg-[var(--color-crate)]/10 text-[var(--color-crate)]"
      : "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${accentClasses}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export default function DashboardPreview({ compact = false }) {
  return (
    <div
      className={`w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl shadow-black/10 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Today's revenue
          </p>
          <p className="font-display text-2xl font-bold text-[var(--color-ink)]">
            {TODAY_REVENUE}
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[var(--color-storefront)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-storefront)]">
          <TrendingUp className="h-3.5 w-3.5" />
          +18%
        </span>
      </div>

      <div className="mt-4 flex h-24 items-end gap-1.5">
        {REVENUE_BARS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-[var(--color-storefront)]/70"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <Chip icon={ClipboardList} label={`${PENDING_ORDERS} pending orders`} accent="crate" />
        <Chip icon={AlertTriangle} label={`${LOW_STOCK.length} low stock`} accent="crate" />
        <Chip icon={Package} label={`${TOTAL_PRODUCTS} products`} />
      </div>

      {!compact && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[var(--color-paper)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Best sellers
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {BEST_SELLERS.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="truncate text-[var(--color-ink)]">{p.name}</span>
                  <span className="shrink-0 text-[var(--color-muted)]">{p.sold} sold</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[var(--color-crate)]/5 p-4">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-crate)]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Low stock
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {LOW_STOCK.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="truncate text-[var(--color-ink)]">{p.name}</span>
                  <span className="shrink-0 font-medium text-[var(--color-crate)]">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[var(--color-paper)] p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Recent transactions
            </p>
            <div className="mt-2 flex flex-col divide-y divide-[var(--color-border-subtle)]">
              {RECENT_TRANSACTIONS.map((tx) => (
                <div key={tx.label} className="flex items-center justify-between py-2 text-sm">
                  <span className="truncate text-[var(--color-ink)]">{tx.label}</span>
                  <span className="shrink-0 font-medium text-[var(--color-storefront)]">
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}