import { Sun, Moon, Palette, Globe } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";
import LanguageToggle from "../../components/common/LanguageToggle";

export default function AppearanceSettings() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--color-ink)]">
        <Palette className="h-4 w-4 text-[var(--color-storefront)]" />
        {t("appearance.heading")}
      </h2>

      <div className="mt-4 flex flex-col divide-y divide-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between py-4 first:pt-0">
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">
              {t("appearance.darkModeTitle")}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {t("appearance.darkModeDesc")}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Toggle dark mode"
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors
              ${theme === "dark" ? "bg-[var(--color-storefront)]" : "bg-[var(--color-border)]"}`}
          >
            <span
              className={`absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface)] shadow transition-transform
                ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`}
            >
              {theme === "dark" ? (
                <Moon className="h-3 w-3 text-[var(--color-storefront)]" />
              ) : (
                <Sun className="h-3 w-3 text-[var(--color-awning-dark)]" />
              )}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between py-4 last:pb-0">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)]">
              <Globe className="h-3.5 w-3.5 text-[var(--color-storefront)]" />
              {t("appearance.languageTitle")}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {t("appearance.languageDesc")}
            </p>
          </div>
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
