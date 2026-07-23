import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const BRAND_HIGHLIGHTS = [
  "Browse what's in stock before you go",
  "Pre-order and skip the wait",
  "Support your neighborhood store",
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] lg:flex">
      {/* Brand panel — desktop only */}
      <div className="relative hidden overflow-hidden bg-[var(--color-storefront)] lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-awning)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 pt-6">
          <Link
            to="/"
            className="font-display text-3xl font-extrabold tracking-tight text-white"
          >
            Sari<span className="text-[var(--color-awning)]">Cart</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-white/70">
            Your neighborhood sari-sari store, online.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <blockquote className="rounded-2xl bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-sm leading-relaxed text-white/85">
              "I used to close the gate not knowing what to restock. Now I see
              it before opening."
            </p>
            <footer className="mt-3 text-xs text-white/50">
              — Aling Nena, store owner
            </footer>
          </blockquote>

          <ul className="flex flex-col gap-3">
            {BRAND_HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-white/80"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-awning)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} SariCart
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col">
        <div className="awning-stripes h-3 w-full lg:hidden" />

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-7 text-center lg:hidden">
              <Link
                to="/"
                className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-ink)]"
              >
                Sari<span className="text-[var(--color-storefront)]">Cart</span>
              </Link>
            </div>

            <div className="rounded-2xl bg-[var(--color-surface)] p-7 shadow-xl shadow-black/5 sm:p-8 lg:border lg:border-[var(--color-border)] lg:shadow-none">
              <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 text-sm text-[var(--color-muted)]">
                  {subtitle}
                </p>
              )}
              <div className="mt-6">{children}</div>
            </div>

            {footer && (
              <div className="mt-5 text-center text-sm text-[var(--color-muted)]">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
