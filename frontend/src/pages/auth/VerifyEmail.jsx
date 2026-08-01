import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { verifyEmail, resendVerification } from "../../services/authService";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying");
  const [resendEmail, setResendEmail] = useState("");
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    verifyEmail(token)
      .then((user) => {
        setResendEmail(user.email);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  async function handleResend() {
    if (!resendEmail) return;
    try {
      await resendVerification(resendEmail);
    } finally {
      setResent(true);
    }
  }

  return (
    <AuthLayout title="Email verification" subtitle="">
      <div className="flex flex-col items-center gap-4 text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-storefront)]" />
            <p className="text-sm text-[var(--color-muted)]">
              Verifying your email…
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-8 w-8 text-[var(--color-storefront)]" />
            <p className="text-sm text-[var(--color-muted)]">
              Your email is verified. You can now log in.
            </p>
            <Link
              to="/login"
              className="text-sm font-medium text-[var(--color-storefront)] hover:underline"
            >
              Go to login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-8 w-8 text-[var(--color-crate)]" />
            <p className="text-sm text-[var(--color-muted)]">
              This verification link is invalid or has expired.
            </p>
            {!resent ? (
              <div className="flex w-full flex-col gap-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-storefront)] focus:ring-2 focus:ring-[var(--color-storefront)]/20"
                />
                <button
                  onClick={handleResend}
                  className="text-sm font-medium text-[var(--color-storefront)] hover:underline"
                >
                  Resend verification email
                </button>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-storefront)]">
                If that email is registered and unverified, a new link is on its
                way.
              </p>
            )}
          </>
        )}
      </div>
    </AuthLayout>
  );
}
