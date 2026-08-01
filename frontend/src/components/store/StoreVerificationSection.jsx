import { useEffect, useState } from "react";
import { BadgeCheck, Clock, XCircle, ShieldAlert } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import Spinner from "../common/Spinner";
import {
  fetchMyStoreVerification,
  submitStoreVerification,
} from "../../services/storeVerificationService";

const STATUS_CONFIG = {
  unsubmitted: {
    label: "Not submitted",
    icon: ShieldAlert,
    classes: "text-[var(--color-muted)]",
  },
  pending: {
    label: "Pending review",
    icon: Clock,
    classes: "text-[var(--color-awning-dark)]",
  },
  verified: {
    label: "Verified",
    icon: BadgeCheck,
    classes: "text-[var(--color-storefront)]",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    classes: "text-[var(--color-crate)]",
  },
};

/**
 * Architecture placeholder for store-owner KYC. Real file-upload wiring
 * (drag-and-drop, compression) can be layered on later using the same
 * storage_service that backs product images — this UI already talks to
 * the real submit/status endpoints, so no backend change is needed then.
 */
export default function StoreVerificationSection() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    government_id_url: "",
    business_permit_url: "",
    barangay_clearance_url: "",
    bir_registration_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyStoreVerification()
      .then(setRecord)
      .catch(() => setError("Couldn't load your verification status."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      setRecord(await submitStoreVerification(form));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't submit your documents. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Loading verification status…" />;

  const status = STATUS_CONFIG[record?.status] || STATUS_CONFIG.unsubmitted;
  const StatusIcon = status.icon;
  const canEdit =
    !record || record.status === "unsubmitted" || record.status === "rejected";

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
        Store verification
      </h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Verified stores build customer trust. Submit your documents for review.
      </p>

      <p
        className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${status.classes}`}
      >
        <StatusIcon className="h-4 w-4" />
        {status.label}
      </p>

      {record?.status === "rejected" && record.rejection_reason && (
        <p className="mt-2 rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]">
          Reason: {record.rejection_reason}
        </p>
      )}
      {error && (
        <p
          className="mt-3 rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
          role="alert"
        >
          {error}
        </p>
      )}

      {canEdit && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <Input
            id="government_id_url"
            label="Government ID (link)"
            placeholder="https://…"
            value={form.government_id_url}
            onChange={(e) =>
              setForm((f) => ({ ...f, government_id_url: e.target.value }))
            }
            required
          />
          <Input
            id="business_permit_url"
            label="Business Permit (link)"
            placeholder="https://…"
            value={form.business_permit_url}
            onChange={(e) =>
              setForm((f) => ({ ...f, business_permit_url: e.target.value }))
            }
            required
          />
          <Input
            id="barangay_clearance_url"
            label="Barangay Clearance (link)"
            placeholder="https://…"
            value={form.barangay_clearance_url}
            onChange={(e) =>
              setForm((f) => ({ ...f, barangay_clearance_url: e.target.value }))
            }
            required
          />
          <Input
            id="bir_registration_url"
            label="BIR Registration (optional)"
            placeholder="https://…"
            value={form.bir_registration_url}
            onChange={(e) =>
              setForm((f) => ({ ...f, bir_registration_url: e.target.value }))
            }
          />
          <Button
            type="submit"
            variant="secondary"
            loading={submitting}
            className="w-fit"
          >
            Submit for review
          </Button>
        </form>
      )}
    </div>
  );
}
