// frontend/src/pages/Onboarding.jsx
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/landing/HeroSection";
import SocialProofSection from "../components/landing/SocialProofSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import DashboardShowcaseSection from "../components/landing/DashboardShowcaseSection";
import InventoryIntelligenceSection from "../components/landing/InventoryIntelligenceSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import PricingSection from "../components/landing/PricingSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import FAQSection from "../components/landing/FAQSection";
import FinalCTASection from "../components/landing/FinalCTASection";

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-paper)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="font-display text-xl font-extrabold tracking-tight text-[var(--color-ink)]">
            Sari<span className="text-[var(--color-storefront)]">Cart</span>
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              Log in
            </Link>
            <Link to="/register">
              <Button variant="secondary" className="!px-4 !py-2 text-sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <DashboardShowcaseSection />
      <InventoryIntelligenceSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
