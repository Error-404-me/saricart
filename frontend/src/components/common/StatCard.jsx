export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "storefront",
}) {
  const accentClasses = {
    storefront:
      "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]",
    crate: "bg-[var(--color-crate)]/10 text-[var(--color-crate)]",
    awning: "bg-[var(--color-awning)]/15 text-[var(--color-awning-dark)]",
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--color-muted)]">{label}</p>
          <p className="mt-1 font-display text-3xl font-bold text-[var(--color-ink)]">
            {value}
          </p>
        </div>
        {Icon && (
          <span className={`rounded-xl p-2.5 ${accentClasses[accent]}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {hint && <p className="mt-2 text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}
