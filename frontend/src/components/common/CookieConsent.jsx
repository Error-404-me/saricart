import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "../../hooks/useCookieConsent";
import Button from "./Button";

export default function CookieConsent() {
  const { hasDecided, setConsent } = useCookieConsent();
  if (hasDecided) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-2xl shadow-black/10 sm:p-5"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-awning-dark)]" />
          <p className="text-sm text-[var(--color-ink)]">
            We use essential storage to keep you logged in and remember your
            cart, plus privacy-friendly analytics to improve SariCart.{" "}
            <Link
              to="/privacy"
              className="font-medium text-[var(--color-storefront)] hover:underline"
            >
              Learn more
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="ghost"
            onClick={() => setConsent("rejected")}
            className="!px-3.5 !py-2 text-sm"
          >
            Reject non-essential
          </Button>
          <Button
            variant="primary"
            onClick={() => setConsent("accepted")}
            className="!px-3.5 !py-2 text-sm"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
