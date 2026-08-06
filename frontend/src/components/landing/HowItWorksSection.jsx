// frontend/src/components/landing/HowItWorksSection.jsx
import { useState } from "react";
import {
  Search,
  ShoppingBag,
  Store,
  Package,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

const AUDIENCES = {
  customer: {
    label: "For Customers",
    steps: [
      {
        icon: Search,
        title: "Find a nearby store",
        desc: "Search by name or browse stores close to you, sorted by distance.",
      },
      {
        icon: ShoppingBag,
        title: "Reserve products",
        desc: "Check what's in stock and place a pre-order — no back-and-forth texting.",
      },
      {
        icon: Store,
        title: "Pick up your order",
        desc: "Swing by when it's ready, pay in person, and grab your order.",
      },
    ],
  },
  owner: {
    label: "For Store Owners",
    steps: [
      {
        icon: Package,
        title: "Add your products",
        desc: "List your catalog with photos, prices, categories, and barcodes.",
      },
      {
        icon: ClipboardList,
        title: "Accept orders",
        desc: "Receive pre-orders and walk-in sales, and update status as you go.",
      },
      {
        icon: TrendingUp,
        title: "Track & grow",
        desc: "Use sales analytics and restock suggestions to grow your business.",
      },
    ],
  },
};

export default function HowItWorksSection() {
  const [active, setActive] = useState("customer");
  const data = AUDIENCES[active];

  return (
    <section className="bg-[var(--color-surface)] py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          How it works
        </h2>

        <div className="mx-auto mt-6 flex w-fit gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] p-1">
          {Object.entries(AUDIENCES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition
                ${
                  active === key
                    ? "bg-[var(--color-storefront)] text-white"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {data.steps.map((step, i) => (
            <div key={step.title} className="text-center sm:text-left">
              <span className="font-display text-4xl font-extrabold text-[var(--color-storefront)]/15">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 inline-flex rounded-xl bg-[var(--color-storefront)]/10 p-2.5 text-[var(--color-storefront)]">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-2 font-display font-bold text-[var(--color-ink)]">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-[var(--color-muted)]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
