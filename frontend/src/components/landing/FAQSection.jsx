// frontend/src/components/landing/FAQSection.jsx
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What is SariCart?",
    a: "SariCart is a digital business platform for sari-sari stores — covering inventory, sales tracking, and customer pre-orders in one app.",
  },
  {
    q: "Is SariCart free?",
    a: "Yes. The Free plan lets you manage up to 100 products with basic inventory and customer orders at no cost.",
  },
  {
    q: "Can I manage multiple stores?",
    a: "Multi-branch support is available on the Business plan, along with staff accounts.",
  },
  {
    q: "Do customers need an account?",
    a: "Yes, customers create a free account to browse stores, place pre-orders, and track pickup status.",
  },
  {
    q: "Does it work on mobile?",
    a: "SariCart is a responsive Progressive Web App — install it on any phone and it works offline for scanning sales.",
  },
  {
    q: "Can I upgrade later?",
    a: "Yes, you can upgrade or downgrade your plan anytime from your account settings.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-[var(--color-paper)] py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          Frequently asked questions
        </h2>

        <div className="mt-8 flex flex-col divide-y divide-[var(--color-border-subtle)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="font-medium text-[var(--color-ink)]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="pb-4 text-sm leading-relaxed text-[var(--color-muted)]">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
