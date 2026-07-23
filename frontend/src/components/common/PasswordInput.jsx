import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  label,
  id,
  error,
  className = "",
  ...props
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[var(--color-ink)]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={`w-full rounded-lg border bg-[var(--color-surface)] px-3.5 py-2.5 pr-11 text-[var(--color-ink)] outline-none transition
            placeholder:text-[var(--color-muted)]/60
            focus:border-[var(--color-storefront)] focus:ring-2 focus:ring-[var(--color-storefront)]/20
            ${error ? "border-[var(--color-crate)]" : "border-[var(--color-border)]"}
            ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          tabIndex={-1}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-overlay)] hover:text-[var(--color-ink)]"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-sm text-[var(--color-crate)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
