export default function ComingSoon({ icon: Icon, title, phase, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
      {Icon && (
        <span className="rounded-full bg-[var(--color-storefront)]/10 p-3 text-[var(--color-storefront)]">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
        {title}
      </h2>
      <p className="max-w-sm text-sm text-[var(--color-muted)]">
        {description}
      </p>
      {phase && (
        <span className="mt-1 rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
          Coming in {phase}
        </span>
      )}
    </div>
  );
}
