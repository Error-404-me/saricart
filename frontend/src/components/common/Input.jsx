export default function Input({ label, id, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-[var(--color-ink)] outline-none transition
          placeholder:text-[var(--color-muted)]/60
          focus:border-[var(--color-storefront)] focus:ring-2 focus:ring-[var(--color-storefront)]/20
          ${error ? "border-[var(--color-crate)]" : "border-[var(--color-border)]"}
          ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-[var(--color-crate)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
