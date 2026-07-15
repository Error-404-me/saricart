export default function Spinner({ label = "Loading…", className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-10 text-[var(--color-muted)] ${className}`}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
