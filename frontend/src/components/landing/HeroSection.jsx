// frontend/src/components/landing/HeroSection.jsx
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Package,
  BarChart3,
  ShoppingCart,
  ScanBarcode,
  Smartphone,
} from "lucide-react";
import Button from "../common/Button";
import DashboardPreview from "./DashboardPreview";
import PhoneMockup from "./PhoneMockup";

const HERO_HIGHLIGHTS = [
  { icon: Package, label: "Smart Inventory Management" },
  { icon: BarChart3, label: "Sales & Revenue Analytics" },
  { icon: ShoppingCart, label: "Customer Pre-orders & Pickup" },
  { icon: ScanBarcode, label: "Barcode Scanning" },
  { icon: Smartphone, label: "Responsive & PWA Ready" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-storefront)]">
      <div className="pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full bg-[var(--color-awning)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[var(--color-awning)]">
            Built for sari-sari store owners
          </span>

          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            The Complete Digital Business Platform for{" "}
            <span className="text-[var(--color-awning)]">
              Every Sari-Sari Store
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-white/75 lg:mx-0">
            Manage inventory, track sales, accept customer pre-orders, and grow
            your business — all from one easy-to-use platform built specifically
            for local neighborhood stores.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/register" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                className="w-full gap-1.5 !bg-[var(--color-awning)] !text-[var(--color-ink)] hover:!bg-[var(--color-awning-dark)]"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                className="w-full !bg-white/10 !text-white hover:!bg-white/20"
              >
                Explore Features
              </Button>
            </a>
          </div>

          <ul className="mt-9 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-white/10 pt-6 sm:grid-cols-2">
            {HERO_HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center justify-center gap-2 text-sm text-white/85 lg:justify-start"
              >
                <Icon className="h-4 w-4 shrink-0 text-[var(--color-awning)]" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
          <DashboardPreview compact />
          <div className="absolute -bottom-8 -left-6 hidden sm:block">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
