import LegalLayout, { LegalSection } from "../../components/legal/LegalLayout";

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy" effectiveDate="July 31, 2026">
      <LegalSection title="1. Marketplace Disclaimer">
        <p>
          Each store on SariCart is independently owned and operated. Refunds
          and returns are the responsibility of the store, not SariCart, except
          where SariCart facilitated payment directly.
        </p>
      </LegalSection>

      <LegalSection title="2. Seller Responsibility">
        <ul className="list-disc pl-5">
          <li>Honor their own refund and return terms;</li>
          <li>Provide accurate product descriptions, pricing, and stock;</li>
          <li>Resolve disputes in good faith within a reasonable time.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Refund Process">
        <ol className="list-decimal pl-5">
          <li>Contact the store directly through your Order details.</li>
          <li>
            If unresolved within 3 business days, contact SariCart support via
            the Contact page with your order number.
          </li>
          <li>
            SariCart may mediate but doesn't guarantee a specific outcome, since
            payment occurs between customer and store at pickup.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="4. Cancellation Process">
        <p>
          Orders may be cancelled while "Pending" or "Accepted" by contacting
          the store. Once "Preparing" or later, cancellation is at the store's
          discretion. Cancelled orders return reserved stock automatically.
        </p>
      </LegalSection>

      <LegalSection title="5. Non-Refundable Situations">
        <ul className="list-disc pl-5">
          <li>Orders marked "Completed" and collected;</li>
          <li>Perishable goods that have left the store's custody;</li>
          <li>
            Change of mind after pickup, unless the store's policy allows it.
          </li>
        </ul>
      </LegalSection>
    </LegalLayout>
  );
}
