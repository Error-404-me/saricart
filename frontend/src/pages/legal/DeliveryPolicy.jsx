import LegalLayout, { LegalSection } from "../../components/legal/LegalLayout";

export default function DeliveryPolicy() {
  return (
    <LegalLayout title="Delivery & Pickup Policy" effectiveDate="July 31, 2026">
      <LegalSection title="1. Pickup Model">
        <p>
          SariCart operates on a pre-order-and-pickup model — customers order
          online and collect in person; SariCart does not itself deliver.
        </p>
      </LegalSection>
      <LegalSection title="2. Store Hours">
        <p>
          Each store sets its own hours and shows its status (Open, Closing
          Soon, Closed). Please collect within posted hours.
        </p>
      </LegalSection>
      <LegalSection title="3. Service Radius">
        <p>
          Store discovery is limited to a radius you choose (2–25km). You may
          still order from any store page you have directly, regardless of
          distance.
        </p>
      </LegalSection>
      <LegalSection title="4. Fees">
        <p>
          No delivery fees apply today, since orders are collected in person.
          Any future delivery service and fees will be disclosed at checkout
          before you confirm an order.
        </p>
      </LegalSection>
      <LegalSection title="5. Estimated Readiness">
        <p>
          There is no fixed delivery estimate — you're notified as the store
          moves your order through Accepted → Preparing → Ready for pickup.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
