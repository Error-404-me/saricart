// frontend/src/pages/settings/LegalSettings.jsx (new file)
import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Truck,
  ChevronRight,
} from "lucide-react";

const LEGAL_LINKS = [
  {
    to: "/terms",
    title: "Terms & Conditions",
    description: "The rules for using SariCart as a customer or store owner.",
    icon: FileText,
  },
  {
    to: "/privacy",
    title: "Privacy Policy",
    description: "How we collect, use, and protect your personal data.",
    icon: ShieldCheck,
  },
  {
    to: "/refund-policy",
    title: "Refund Policy",
    description: "How refunds and cancellations work between you and a store.",
    icon: RotateCcw,
  },
  {
    to: "/delivery-policy",
    title: "Delivery & Pickup Policy",
    description: "How pre-order pickup works on SariCart.",
    icon: Truck,
  },
];

export default function LegalSettings() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
        Legal & policies
      </h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Review the terms, policies, and privacy practices that govern your use
        of SariCart.
      </p>

      <div className="mt-4 flex flex-col divide-y divide-[var(--color-border-subtle)]">
        {LEGAL_LINKS.map(({ to, title, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3 py-4 first:pt-0 last:pb-0"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--color-ink)] group-hover:text-[var(--color-storefront)]">
                {title}
              </p>
              <p className="text-sm text-[var(--color-muted)]">{description}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-storefront)]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
    