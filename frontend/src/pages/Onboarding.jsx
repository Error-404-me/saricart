import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  MapPin,
  Star,
  ArrowRight,
  ScanBarcode,
  BarChart3,
  Smartphone,
  Package,
  Users,
} from "lucide-react";
import Button from "../components/common/Button";
import { useLanguage } from "../hooks/useLanguage";

const FEATURES = [
  {
    icon: Search,
    titleKey: "onboarding.feature1Title",
    descKey: "onboarding.feature1Desc",
  },
  {
    icon: ShoppingBag,
    titleKey: "onboarding.feature2Title",
    descKey: "onboarding.feature2Desc",
  },
  {
    icon: Store,
    titleKey: "onboarding.feature3Title",
    descKey: "onboarding.feature3Desc",
  },
  {
    icon: ScanBarcode,
    titleKey: "onboarding.feature4Title",
    descKey: "onboarding.feature4Desc",
  },
];

const STEPS = [
  {
    number: "01",
    titleKey: "onboarding.step1Title",
    descKey: "onboarding.step1Desc",
  },
  {
    number: "02",
    titleKey: "onboarding.step2Title",
    descKey: "onboarding.step2Desc",
  },
  {
    number: "03",
    titleKey: "onboarding.step3Title",
    descKey: "onboarding.step3Desc",
  },
];

const HERO_HIGHLIGHTS = [
  { icon: Package, labelKey: "onboarding.heroHighlight1" },
  { icon: BarChart3, labelKey: "onboarding.heroHighlight2" },
  { icon: ShoppingCart, labelKey: "onboarding.heroHighlight3" },
  { icon: ScanBarcode, labelKey: "onboarding.heroHighlight4" },
  { icon: Smartphone, labelKey: "onboarding.heroHighlight5" },
];

export default function Onboarding() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Top bar */}
      <header className="bg-[var(--color-storefront)] sticky top-0 z-50 bg-[var(--color-paper)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="font-display text-xl font-extrabold tracking-tight text-white">
            Sari<span className="text-[var(--color-awning)]">Cart</span>
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/75 hover:text-white"
            >
              {t("onboarding.logIn")}
            </Link>
            <Link to="/register">
              <Button
                variant="secondary"
                className="!px-4 !py-2 text-sm !bg-[var(--color-awning)] !text-[var(--color-ink)] hover:!bg-[var(--color-awning-dark)]"
              >
                {t("onboarding.getStarted")}
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
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              {t("onboarding.heroTitlePrefix")}{" "}
              <span className="text-[var(--color-awning)]">
                {t("onboarding.heroTitleHighlight")}
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-white/75 lg:mx-0">
              {t("onboarding.heroSubtitle")}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full gap-1.5 !bg-[var(--color-awning)] !text-[var(--color-ink)] hover:!bg-[var(--color-awning-dark)]"
                >
                  {t("onboarding.startFree")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full !bg-white/10 !text-white hover:!bg-white/20"
                >
                  {t("onboarding.exploreFeatures")}
                </Button>
              </a>
            </div>

            <ul className="mt-9 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-white/10 pt-6 sm:grid-cols-2">
              {HERO_HIGHLIGHTS.map(({ icon: Icon, labelKey }) => (
                <li
                  key={labelKey}
                  className="flex items-center justify-center gap-2 text-sm text-white/85 lg:justify-start"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[var(--color-awning)]" />
                  {t(labelKey)}
                </li>
              ))}
            </ul>
          </div>

          {/* App preview mockup — decorative demo screen, left in English
              rather than translated: it's illustrative fake UI, not real
              content a visitor needs to read to use the app. */}
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
      <section
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 scroll-smooth"
        id="features"
      >
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            {t("onboarding.featuresHeading")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--color-muted)]">
            {t("onboarding.featuresSubheading")}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-storefront)]/30 hover:shadow-md"
            >
              <span className="inline-flex rounded-xl bg-[var(--color-storefront)]/10 p-2.5 text-[var(--color-storefront)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3.5 font-display font-bold text-[var(--color-ink)]">
                {t(titleKey)}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[var(--color-surface)] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            {t("onboarding.howItWorksHeading")}
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center sm:text-left">
                <span className="font-display text-4xl font-extrabold text-[var(--color-storefront)]/15">
                  {step.number}
                </span>
                <h3 className="mt-1 font-display font-bold text-[var(--color-ink)]">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--color-muted)]">
                  {t(step.descKey)}
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
            {t("onboarding.ctaHeading")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/75">
            {t("onboarding.ctaSubheading")}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button
                variant="secondary"
                className="gap-1.5 !bg-[var(--color-awning)] !text-[var(--color-ink)] hover:!bg-[var(--color-awning-dark)]"
              >
                {t("onboarding.ctaButton")}
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
            © {new Date().getFullYear()} SariCart.{" "}
            {t("onboarding.footerTagline")}
          </span>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {t("onboarding.footerHaveStore")}{" "}
            <Link
              to="/register"
              className="font-medium text-[var(--color-storefront)] hover:underline"
            >
              {t("onboarding.footerListIt")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
