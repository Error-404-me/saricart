import { Link } from "react-router-dom";
import { Store } from "lucide-react";

const LINK_GROUPS = [
  {
    heading: "Company",
    links: [
      { to: "/", label: "Home" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { to: "/contact", label: "Help Center" },
      { to: "/refund-policy", label: "Refund Policy" },
      { to: "/delivery-policy", label: "Delivery Policy" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms & Conditions" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-4 sm:px-6">
        <div className="col-span-2 sm:col-span-1">
          <Link
            to="/"
            className="flex items-center gap-1.5 font-display text-lg font-extrabold text-[var(--color-ink)]"
          >
            <Store className="h-4 w-4 text-[var(--color-storefront)]" />
            Sari<span className="text-[var(--color-awning-dark)]">Cart</span>
          </Link>
          <p className="mt-2 max-w-xs text-sm text-[var(--color-muted)]">
            Your neighborhood sari-sari store, online.
          </p>
        </div>

        {LINK_GROUPS.map((group) => (
          <div key={group.heading}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              {group.heading}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-storefront)] hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--color-border-subtle)] px-4 py-5 text-center text-xs text-[var(--color-muted)] sm:px-6">
        © {new Date().getFullYear()} SariCart. All Rights Reserved.
      </div>
    </footer>
  );
}
