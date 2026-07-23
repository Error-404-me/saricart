import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Store,
  MapPin,
  Star,
  ArrowRight,
  ScanBarcode,
  Users,
} from "lucide-react";
import Button from "../components/common/Button";

const FEATURES = [
  {
    icon: Search,
    title: "Browse & search",
    description:
      "See what's in stock at your neighborhood store before you go.",
  },
  {
    icon: ShoppingBag,
    title: "Pre-order",
    description:
      "Add what you need to your cart and place your order ahead of time.",
  },
  {
    icon: Store,
    title: "Pick up in store",
    description:
      "Swing by, pay, and grab your order — no more guessing what's available.",
  },
  {
    icon: ScanBarcode,
    title: "Built for owners too",
    description:
      "Scan sales, track stock, and see what's selling — right from your phone.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Find a store nearby",
    description:
      "Search by name or browse stores close to you, sorted by distance.",
  },
  {
    number: "02",
    title: "Add what you need",
    description:
      "Check what's in stock and build your order — no back-and-forth texting.",
  },
  {
    number: "03",
    title: "Pick up & pay in person",
    description: "Swing by when it's ready. Simple as that.",
  },
];

const STATS = [
  { value: "1,200+", label: "Sari-sari stores" },
  { value: "45,000+", label: "Orders placed" },
  { value: "4.8★", label: "Average rating" },
];

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Top bar */}
      <header className="border-b border-[var(--color-border-subtle)] sticky top-0 z-40 bg-black opacity-95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="font-display text-xl font-extrabold tracking-tight text-[var(--color-ink)]">
            Sari<span className="text-awning">Cart</span>
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              Log in
            </Link>
            <Link to="/register">
              <Button variant="primary" className="!px-4 !py-2 text-sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--color-storefront)]">
        <div className="pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full bg-[var(--color-awning)]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-left">
            {/* <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              <MapPin className="h-3.5 w-3.5" />
              Now live in Cebu, Manila &amp; beyond
            </span> */}
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Your neighborhood store,{" "}
              <span className="text-[var(--color-awning)]">online.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-white/75 lg:mx-0">
              Browse what's in stock, pre-order ahead of time, and pick up in
              person no more showing up to an empty shelf.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full gap-1.5 !bg-[var(--color-awning)] !text-[var(--color-ink)] hover:!bg-[var(--color-awning-dark)]"
                >
                  Create an account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full !bg-white/10 !text-white hover:!bg-white/20"
                >
                  Log in
                </Button>
              </Link>
            </div>

            <div className="mt-9 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-xl font-bold text-white sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* App preview mockup */}
          <div className="mx-auto w-full max-w-sm lg:mx-0 lg:ml-auto">
            <div className="rounded-3xl bg-[var(--color-paper)] p-3 shadow-2xl shadow-black/30">
              <div className="rounded-2xl bg-[var(--color-surface)] p-4">
                <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                  <span className="text-xs text-[var(--color-muted)]">
                    Search products…
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]">
                    <Store className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                      Aling Nena's Store
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-muted)]">
                      <Star className="h-3 w-3 fill-[var(--color-awning)] text-[var(--color-awning)]" />
                      4.9 · 0.4km away
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--color-storefront)]/10 px-2 py-1 text-[10px] font-medium text-[var(--color-storefront)]">
                    Open
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {["🧴", "🥫", "🍜"].map((emoji, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-[var(--color-paper)] p-2.5 text-center"
                    >
                      <span className="text-lg">{emoji}</span>
                      <p className="mt-1 h-1.5 w-full rounded-full bg-[var(--color-border)]" />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-[var(--color-storefront)] px-3.5 py-2.5">
                  <span className="text-xs font-medium text-white/80">
                    3 items · ₱127.00
                  </span>
                  <span className="rounded-lg bg-[var(--color-awning)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                    Checkout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            Everything you need, in one app
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--color-muted)]">
            Whether you're picking up snacks or running the store, SariCart
            keeps it simple.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-storefront)]/30 hover:shadow-md"
            >
              <span className="inline-flex rounded-xl bg-[var(--color-storefront)]/10 p-2.5 text-[var(--color-storefront)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3.5 font-display font-bold text-[var(--color-ink)]">
                {title}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[var(--color-surface)] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            How it works
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center sm:text-left">
                <span className="font-display text-4xl font-extrabold text-[var(--color-storefront)]/15">
                  {step.number}
                </span>
                <h3 className="mt-1 font-display font-bold text-[var(--color-ink)]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--color-muted)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--color-storefront)] px-6 py-12 text-center sm:px-12">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[var(--color-awning)]/10 blur-3xl" />
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Ready to skip the guesswork?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/75">
            Join thousands of shoppers and store owners already using SariCart.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button
                variant="secondary"
                className="gap-1.5 !bg-[var(--color-awning)] !text-[var(--color-ink)] hover:!bg-[var(--color-awning-dark)]"
              >
                Create your free account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-subtle)] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-[var(--color-muted)] sm:flex-row sm:px-6">
          <span>
            © {new Date().getFullYear()} SariCart. Made for sari-sari stores
            everywhere.
          </span>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Have a store?{" "}
            <Link
              to="/register"
              className="font-medium text-[var(--color-storefront)] hover:underline"
            >
              List it here
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
