// frontend/src/components/landing/FinalCTASection.jsx
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../common/Button";

export default function FinalCTASection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--color-storefront)] px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[var(--color-awning)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Ready to Modernize Your Sari-Sari Store?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/75">
          Start managing inventory, accepting orders, and growing your business
          with SariCart today.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/register">
            <Button
              variant="secondary"
              className="gap-1.5 !bg-[var(--color-awning)] !text-[var(--color-ink)] hover:!bg-[var(--color-awning-dark)]"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button
              variant="secondary"
              className="!bg-white/10 !text-white hover:!bg-white/20"
            >
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
