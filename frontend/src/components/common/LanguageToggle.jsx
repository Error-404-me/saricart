import { Globe } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

const OPTIONS = [
  { code: "en", label: "EN" },
  { code: "fil", label: "FIL" },
];

/**
 * Small EN / FIL switch. Deliberately shows only the icon + two-letter
 * codes — never the full "English"/"Filipino" words — so someone who
 * isn't yet comfortable reading either language can still find and use
 * it (e.g. on the login screen, before they've picked a language at all).
 *
 * `compact`: a single button that cycles to the next language on click,
 * sized for the collapsed icon-rail sidebar and the mobile top bar, where
 * there's no room for a two-option segmented control. Unlike the other
 * sidebar controls it keeps its text label visible even when collapsed —
 * hiding it behind a hover-only tooltip would defeat the point for
 * someone who can't yet comfortably read a tooltip in either language.
 */
export default function LanguageToggle({ compact = false, className = "" }) {
  const { lang, setLang } = useLanguage();

  if (compact) {
    const currentIndex = OPTIONS.findIndex((o) => o.code === lang);
    const current = OPTIONS[currentIndex] ?? OPTIONS[0];
    const next = OPTIONS[(currentIndex + 1) % OPTIONS.length];
    return (
      <button
        type="button"
        onClick={() => setLang(next.code)}
        title={`Switch to ${next.label}`}
        aria-label={`Language: ${current.label}. Tap to change.`}
        className={`flex items-center gap-1 rounded-lg p-2 text-xs font-semibold
          text-[var(--color-muted)] transition
          hover:bg-[var(--color-overlay)] hover:text-[var(--color-ink)] ${className}`}
      >
        <Globe className="h-4 w-4" />
        {current.label}
      </button>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1 ${className}`}
    >
      <Globe className="ml-1.5 h-3.5 w-3.5 shrink-0 text-[var(--color-muted)]" />
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLang(option.code)}
          aria-pressed={lang === option.code}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition
            ${
              lang === option.code
                ? "bg-[var(--color-storefront)] text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}