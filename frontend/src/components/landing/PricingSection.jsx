// frontend/src/components/landing/PricingSection.jsx
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Button from "../common/Button";

const PLANS = [
  {
    name: "Free",
    price: "₱0",
    period: "forever",
    features: ["100 products", "Basic inventory", "Customer orders"],
    highlighted: false,
    cta: "Start Free",
  },
  {
    name: "Starter",
    price: "₱149",
    period: "/month",
    features: [
      "Unlimited products",
      "Barcode scanner",
      "Reports",
      "Sales analytics",
    ],
    highlighted: true,
    cta: "Choose Starter",
  },
  {
    name: "Business",
    price: "₱399",
    period: "/month",
    features: [
      "Staff accounts",
      "Multi-branch",
      "Advanced analytics",
      "Priority support",
    ],
    highlighted: false,
    cta: "Choose Business",
  },
];

export default function PricingSection() {
  return (
    <section className="bg-[var(--color-paper)] py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
            Start free, upgrade as your store grows. No hidden fees.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.highlighted
                  ? "border-[var(--color-storefront)] bg-[var(--color-surface)] shadow-xl shadow-[var(--color-storefront)]/10 sm:-translate-y-2"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-storefront)] px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                {plan.name}
              </h3>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-3xl font-extrabold text-[var(--color-ink)]">
                  {plan.price}
                </span>
                <span className="text-sm text-[var(--color-muted)]">
                  {plan.period}
                </span>
              </p>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-[var(--color-ink)]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-storefront)]" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to="/register" className="mt-6">
                <Button
                  variant={plan.highlighted ? "secondary" : "ghost"}
                  className={`w-full ${plan.highlighted ? "" : "border border-[var(--color-border)]"}`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
