import { useLocation, Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";

export default function VerifyEmailSent() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <AuthLayout
      title="Check your email"
      subtitle="One more step before you can log in."
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="rounded-full bg-[var(--color-storefront)]/10 p-3 text-[var(--color-storefront)]">
          <MailCheck className="h-6 w-6" />
        </span>
        <p className="text-sm text-[var(--color-muted)]">
          We sent a verification link to{" "}
          {email ? (
            <strong className="text-[var(--color-ink)]">{email}</strong>
          ) : (
            "your email address"
          )}
          . Click the link to activate your account, then log in.
        </p>
        <Link
          to="/login"
          className="text-sm font-medium text-[var(--color-storefront)] hover:underline"
        >
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
