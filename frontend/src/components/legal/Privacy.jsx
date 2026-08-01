import { Link } from "react-router-dom";
import LegalLayout, { LegalSection } from "../../components/legal/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate="July 31, 2026">
      <p>
        SariCart ("we", "us", "our") respects your privacy and is committed to
        protecting your personal data in accordance with the Data Privacy Act of
        2012 (Republic Act No. 10173), its Implementing Rules and Regulations,
        and issuances of the National Privacy Commission (NPC).
      </p>

      <LegalSection title="1. Information We Collect">
        <ul className="list-disc pl-5">
          <li>
            <strong>Account data:</strong> username, email, hashed password, and
            role (customer or store owner).
          </li>
          <li>
            <strong>Store data:</strong> store name, location, hours, and (if
            submitted) government ID, business permit, barangay clearance, and
            BIR registration for store verification.
          </li>
          <li>
            <strong>Transaction data:</strong> orders placed, items purchased,
            prices, and status history.
          </li>
          <li>
            <strong>Device & usage data:</strong> IP address, browser type, and
            pages visited, for security and analytics.
          </li>
          <li>
            <strong>Location data:</strong> your device's GPS, only when you use
            "Find stores near you" or set your store's location.
          </li>
          <li>
            <strong>Push notification data:</strong> your browser's push
            subscription endpoint, if enabled.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Purpose of Collection">
        <ul className="list-disc pl-5">
          <li>Create and authenticate your account;</li>
          <li>
            Process pre-orders and walk-in sales between customers and stores;
          </li>
          <li>Show nearby stores and personalize recommendations;</li>
          <li>
            Send order updates, low-stock alerts, and account notifications;
          </li>
          <li>Verify store owner identity for marketplace trust and safety;</li>
          <li>
            Detect fraud, enforce our Terms, and maintain platform security;
          </li>
          <li>Comply with legal and regulatory obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Data Storage & Security">
        <p>
          Data is stored in an encrypted-at-rest PostgreSQL database. Passwords
          are hashed with bcrypt and never stored or transmitted in plain text.
          All traffic is encrypted via HTTPS/TLS. Access to production data is
          restricted to authorized personnel.
        </p>
      </LegalSection>

      <LegalSection title="4. Your Rights Under the Data Privacy Act">
        <ul className="list-disc pl-5">
          <li>Be informed about how your data is processed;</li>
          <li>Access your personal data;</li>
          <li>Correct inaccurate data (Settings → Profile);</li>
          <li>
            Object to or withdraw consent for certain processing (Settings →
            Notifications);
          </li>
          <li>
            Request erasure or blocking of your data, subject to legal retention
            requirements;
          </li>
          <li>Data portability, where technically feasible;</li>
          <li>
            File a complaint with the National Privacy Commission
            (privacy.gov.ph).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <p>
          We retain data only as long as necessary. Deleting your account
          deactivates it immediately and erases it permanently after 30 days,
          unless you log back in during that window. Transaction records tied to
          completed orders may be retained longer where required for tax,
          accounting, or dispute-resolution purposes.
        </p>
      </LegalSection>

      <LegalSection title="6. Third-Party Services">
        <ul className="list-disc pl-5">
          <li>
            <strong>Cloudinary</strong> — stores product and store photos;
          </li>
          <li>
            <strong>Vercel Analytics & Speed Insights</strong> — aggregated,
            privacy-friendly usage analytics;
          </li>
          <li>
            <strong>Web push services</strong> — deliver notifications you opt
            into.
          </li>
        </ul>
        <p>We do not sell your personal data.</p>
      </LegalSection>

      <LegalSection title="7. Cookies & Tracking">
        <p>
          We use browser storage for essential functions (session, cart,
          theme/language) and limited analytics for aggregate usage. See the
          cookie banner to manage your preference.
        </p>
      </LegalSection>

      <LegalSection title="8. Data Deletion Process">
        <p>
          Request deletion anytime via Settings → Danger Zone (password
          confirmation required). Accounts with active products or order history
          must contact{" "}
          <a
            href="mailto:privacy@saricart.app"
            className="text-[var(--color-storefront)] hover:underline"
          >
            privacy@saricart.app
          </a>{" "}
          so records we're legally required to keep can be preserved while your
          account is closed.
        </p>
      </LegalSection>

      <LegalSection title="9. Children's Privacy">
        <p>SariCart is not directed at children under 18.</p>
      </LegalSection>

      <LegalSection title="10. Changes to This Policy">
        <p>Material changes will be notified via email or an in-app notice.</p>
      </LegalSection>

      <LegalSection title="11. Contact Us">
        <p>
          Email:{" "}
          <a
            href="mailto:privacy@saricart.app"
            className="text-[var(--color-storefront)] hover:underline"
          >
            privacy@saricart.app
          </a>
          {" · "}
          <Link
            to="/contact"
            className="text-[var(--color-storefront)] hover:underline"
          >
            Contact page
          </Link>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
