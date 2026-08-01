import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import Spinner from "../../components/common/Spinner";
import AuditLogTable from "../../components/owner/AuditLogTable";
import { fetchAuditLogs } from "../../services/auditService";

export default function AuditLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAuditLogs({ limit: 100 })
      .then(setEntries)
      .catch(() =>
        setError("Couldn't load your activity log. Please try again."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-[var(--color-ink)]">
          <ShieldCheck className="h-5 w-5 text-[var(--color-storefront)]" />
          Activity log
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          A record of security-sensitive actions on your account and store.
        </p>
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
        <Spinner label="Loading activity…" />
      ) : (
        <AuditLogTable entries={entries} />
      )}
    </div>
  );
}
