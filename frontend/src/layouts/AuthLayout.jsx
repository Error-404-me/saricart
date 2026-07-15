export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-[var(--color-storefront)] flex flex-col">
      {/* Storefront awning band — the page's one signature element */}
      <div className="awning-stripes h-3 w-full" />

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center">
            <span className="font-display text-3xl font-extrabold tracking-tight text-white">
              Sari<span className="text-[var(--color-awning)]">Cart</span>
            </span>
            <p className="mt-1 text-sm text-white/70">
              Your neighborhood sari-sari store, online.
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--color-paper)] p-7 shadow-xl shadow-black/20 sm:p-8">
            <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-[var(--color-muted)]">{subtitle}</p>
            )}
            <div className="mt-6">{children}</div>
          </div>

          {footer && <div className="mt-5 text-center text-sm text-white/80">{footer}</div>}
        </div>
      </div>

      <div className="awning-stripes h-3 w-full" />
    </div>
  );
}
