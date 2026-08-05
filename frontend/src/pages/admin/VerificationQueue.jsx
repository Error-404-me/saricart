import { useEffect, useState } from "react";
import { ShieldCheck, ExternalLink, Check, X } from "lucide-react";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import {
  fetchPendingVerifications,
  reviewStoreVerification,
} from "../../services/storeVerificationService";

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "unsubmitted", label: "Unsubmitted" },
];

const DOCUMENT_FIELDS = [
  { key: "government_id_url", label: "Government ID" },
  { key: "business_permit_url", label: "Business Permit" },
  { key: "barangay_clearance_url", label: "Barangay Clearance" },
  { key: "bir_registration_url", label: "BIR Registration" },
];

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function VerificationQueue() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchPendingVerifications(statusFilter)
      .then(setRecords)
      .catch(() => setError("Couldn't load verification requests."))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  async function handleApprove(record) {
    setActingId(record.id);
    setError("");
    try {
      await reviewStoreVerification(record.id, { status: "verified" });
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
    } catch (err) {
      setError(
        err.response?.data?.detail || "Couldn't approve this submission.",
      );
    } finally {
      setActingId(null);
    }
  }

  function openReject(record) {
    setRejectTarget(record);
    setRejectionReason("");
    setRejectError("");
  }

  async function confirmReject() {
    if (!rejectionReason.trim()) {
      setRejectError("Enter a reason so the owner knows what to fix.");
      return;
    }
    setActingId(rejectTarget.id);
    try {
      await reviewStoreVerification(rejectTarget.id, {
        status: "rejected",
        rejection_reason: rejectionReason.trim(),
      });
      setRecords((prev) => prev.filter((r) => r.id !== rejectTarget.id));
      setRejectTarget(null);
    } catch (err) {
      setRejectError(
        err.response?.data?.detail || "Couldn't reject this submission.",
      );
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-[var(--color-ink)]">
          <ShieldCheck className="h-5 w-5 text-[var(--color-storefront)]" />
          Store verification queue
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Review submitted documents and approve or reject store owner
          verification requests.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition
              ${
                statusFilter === tab.value
                  ? "bg-[var(--color-storefront)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-overlay)]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p
          className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
          role="alert"
        >
          {error}
        </p>
      )}

      {loading ? (
        <Spinner label="Loading verification requests…" />
      ) : records.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center text-sm text-[var(--color-muted)]">
          No {statusFilter} submissions.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-[var(--color-ink)]">
                    {record.store_name || "Unnamed store"}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Owner: {record.owner_username || `#${record.owner_id}`}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Submitted {formatDate(record.submitted_at)}
                  </p>
                </div>

                {record.status === "pending" && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="ghost"
                      loading={actingId === record.id}
                      onClick={() => openReject(record)}
                      className="gap-1.5 !text-[var(--color-crate)]"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      loading={actingId === record.id}
                      onClick={() => handleApprove(record)}
                      className="gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>

              {record.status === "rejected" && record.rejection_reason && (
                <p className="mt-3 rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]">
                  Reason: {record.rejection_reason}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-3">
                {DOCUMENT_FIELDS.map(({ key, label }) =>
                  record[key] ? (
                    <a
                      key={key}
                      href={record[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-storefront)] hover:underline"
                    >
                      {label}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null,
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title={`Reject ${rejectTarget?.store_name || "this submission"}?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={actingId === rejectTarget?.id}
              onClick={confirmReject}
              className="!bg-[var(--color-crate)] hover:!bg-[var(--color-crate-dark)]"
            >
              Reject submission
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <label
            htmlFor="rejection-reason"
            className="text-sm font-medium text-[var(--color-ink)]"
          >
            Reason for rejection
          </label>
          <textarea
            id="rejection-reason"
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Business permit photo is unreadable"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition
              focus:border-[var(--color-storefront)] focus:ring-2 focus:ring-[var(--color-storefront)]/20"
          />
          {rejectError && (
            <p className="text-sm text-[var(--color-crate)]" role="alert">
              {rejectError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
