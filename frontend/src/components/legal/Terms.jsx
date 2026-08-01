import { Link } from "react-router-dom";
import LegalLayout, { LegalSection } from "./LegalLayout";

export default function Terms() {
  return (
    <LegalLayout title="Terms and Conditions" effectiveDate="July 31, 2026">
      <p>
        By creating an account or using SariCart ("Platform"), you agree to
        these Terms. If you do not agree, do not use the Platform.
      </p>

      <LegalSection title="1. Eligibility">
        <p>
          You must be at least 18 years old, or the age of majority in your
          jurisdiction.
        </p>
      </LegalSection>

      <LegalSection title="2. Customer Responsibilities">
        <ul className="list-disc pl-5">
          <li>Provide accurate registration and order information;</li>
          <li>Pay for and collect pre-orders as agreed with the store;</li>
          <li>
            Use the Platform lawfully and not abuse or defraud store owners.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Store Owner Responsibilities">
        <ul className="list-disc pl-5">
          <li>
            List products accurately, including price, availability, and unit of
            sale;
          </li>
          <li>Honor accepted pre-orders and fulfill them in good faith;</li>
          <li>Maintain accurate stock and update order status promptly;</li>
          <li>
            Comply with Philippine business, tax (BIR), and consumer protection
            laws;
          </li>
          <li>
            Provide truthful documents if requested for store verification;
          </li>
          <li>
            Be solely responsible for the quality, safety, and legality of
            products sold.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Marketplace Rules">
        <p>
          SariCart connects independent store owners with nearby customers. We
          are not a party to, and do not guarantee, any transaction between a
          Customer and a Store Owner. Payment happens directly between them at
          pickup unless otherwise stated.
        </p>
      </LegalSection>

      <LegalSection title="5. Prohibited Activities">
        <ul className="list-disc pl-5">
          <li>
            Listing illegal, counterfeit, hazardous, or regulated goods without
            authorization;
          </li>
          <li>Disabling or interfering with Platform security;</li>
          <li>
            Scraping, reverse-engineering, or misusing Platform
            data/infrastructure;
          </li>
          <li>
            Impersonating another person/store or submitting false verification
            documents;
          </li>
          <li>Harassing or defrauding another user;</li>
          <li>Uploading malware or attempting unauthorized system access.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Intellectual Property">
        <p>
          The SariCart name, logo, design, and software are owned by SariCart
          and protected by Philippine and international IP law. Store owners
          retain ownership of content they upload (photos, descriptions) but
          grant SariCart a non-exclusive, royalty-free license to display it for
          operating the marketplace. Unauthorized reproduction of Platform
          branding is prohibited; report suspected infringement via our{" "}
          <Link
            to="/contact"
            className="text-[var(--color-storefront)] hover:underline"
          >
            Contact page
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, SariCart shall not be liable
          for indirect, incidental, or consequential damages arising from
          Platform use, Customer–Store Owner disputes, product quality/safety,
          or service interruptions. Total liability shall not exceed fees (if
          any) paid to SariCart in the preceding twelve months.
        </p>
      </LegalSection>

      <LegalSection title="8. Account Termination">
        <p>
          We may suspend or terminate accounts that violate these Terms or
          engage in fraudulent conduct. You may delete your own account anytime
          via Settings → Danger Zone, subject to our{" "}
          <Link
            to="/privacy"
            className="text-[var(--color-storefront)] hover:underline"
          >
            Privacy Policy
          </Link>
          's retention terms.
        </p>
      </LegalSection>

      <LegalSection title="9. Platform Modifications">
        <p>
          We may modify, suspend, or discontinue any part of the Platform at any
          time, with reasonable notice of material changes.
        </p>
      </LegalSection>

      <LegalSection title="10. Governing Law">
        <p>
          These Terms are governed by the laws of the Republic of the
          Philippines, subject to the exclusive jurisdiction of Philippine
          courts.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Questions? Visit our{" "}
          <Link
            to="/contact"
            className="text-[var(--color-storefront)] hover:underline"
          >
            Contact page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
