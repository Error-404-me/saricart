import { Link } from "react-router-dom";
import { Search, ShoppingBag, Store } from "lucide-react";
import Button from "../components/common/Button";

const FEATURES = [
  {
    icon: Search,
    title: "Browse & search",
    description: "See what's in stock at your neighborhood store before you go.",
  },
  {
    icon: ShoppingBag,
    title: "Pre-order",
    description: "Add what you need to your cart and place your order ahead of time.",
  },
  {
    icon: Store,
    title: "Pick up in store",
    description: "Swing by, pay, and grab your order — no more guessing what's available.",
  },
];

export default function Onboarding() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-storefront)]">
      <div className="awning-stripes h-3 w-full" />

      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-16 text-center">
        <div>
          <span className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Sari<span className="text-[var(--color-awning)]">Cart</span>
          </span>
          <p className="mx-auto mt-3 max-w-md text-white/75">
            Your neighborhood sari-sari store, online. Browse what's in stock, pre-order, and
            pick up in person.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full">
              Log in
            </Button>
          </Link>
          <Link to="/register" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              className="w-full !bg-white/10 !text-white hover:!bg-white/20"
            >
              Create an account
            </Button>
          </Link>
        </div>

        <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl bg-[var(--color-paper)] p-5 text-left">
              <span className="inline-flex rounded-xl bg-[var(--color-storefront)]/10 p-2 text-[var(--color-storefront)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-display font-bold text-[var(--color-ink)]">{title}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="awning-stripes h-3 w-full" />
    </div>
  );
}
