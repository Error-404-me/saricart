import { Package, Users, ShieldCheck, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: Package,
    title: "Digital Storefronts",
    desc: "Store owners list, price, and manage their catalog from a phone.",
  },
  {
    icon: Users,
    title: "Community Discovery",
    desc: "Customers find and support sari-sari stores near them.",
  },
  {
    icon: BarChart3,
    title: "Business Insights",
    desc: "Sales analytics, restock suggestions, and stock history for owners.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    desc: "Store verification, audit logging, and secure account management.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
        About SariCart
      </h1>
      <p className="mt-4 leading-relaxed text-[var(--color-muted)]">
        SariCart is a digital platform built for the Philippine sari-sari store
        — the small neighborhood shops that anchor communities across the
        country. We give store owners tools to run their business digitally, and
        give customers a simple way to check what's in stock before walking
        over.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
            Our Mission
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            To empower every sari-sari store owner with accessible digital tools
            that make running their business easier, more profitable, and more
            resilient.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
            Our Vision
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            A Philippines where every neighborhood store, no matter how small,
            has the same digital reach as a modern retail chain.
          </p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-[var(--color-ink)]">
        What SariCart Offers
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-medium text-[var(--color-ink)]">{title}</h3>
              <p className="mt-0.5 text-sm text-[var(--color-muted)]">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-[var(--color-ink)]">
        Where We're Headed
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
        We're building toward verified store badges, delivery partnerships,
        supplier integrations, and deeper financial tools — always grounded in
        what actually helps a sari-sari store owner run their day.
      </p>
    </div>
  );
}
