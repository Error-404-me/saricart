import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import { useLanguage } from "../hooks/useLanguage";

export default function Unauthorized() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-paper)] px-4 text-center">
      <span className="font-display text-5xl">🚫</span>
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
        {t("unauthorized.title")}
      </h1>
      <p className="max-w-sm text-[var(--color-muted)]">
        {t("unauthorized.description")}
      </p>
      <Link to="/">
        <Button variant="secondary">{t("unauthorized.backButton")}</Button>
      </Link>
    </div>
  );
}
