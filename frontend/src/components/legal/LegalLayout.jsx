export default function LegalLayout({ title, effectiveDate, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
        {title}
      </h1>
      {effectiveDate && (
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Effective date: {effectiveDate}
        </p>
      )}
      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-[var(--color-ink)]">
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
      <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
        {title}
      </h2>
      <div className="mt-2 flex flex-col gap-2 text-[var(--color-muted)]">
        {children}
      </div>
    </section>
  );
}
