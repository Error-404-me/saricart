const variants = {
  primary:
    "bg-[var(--color-crate)] text-white hover:bg-[var(--color-crate-dark)] focus-visible:ring-[var(--color-crate)]/40",
  secondary:
    "bg-[var(--color-storefront)] text-white hover:bg-[var(--color-storefront-light)] focus-visible:ring-[var(--color-storefront)]/40",
  ghost:
    "bg-transparent text-[var(--color-storefront)] hover:bg-[var(--color-storefront)]/8 focus-visible:ring-[var(--color-storefront)]/30",
};

export default function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold
        transition outline-none focus-visible:ring-2
        disabled:cursor-not-allowed disabled:opacity-60
        ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
}
