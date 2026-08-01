import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { forgotPassword } from "../../services/authService";
import { isValidEmail } from "../../utils/validators";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword(email);
    } finally {
      setSubmitting(false);
      setSent(true); // never reveal account existence
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="We'll email you a reset link."
    >
      {sent ? (
        <p className="rounded-lg bg-[var(--color-storefront)]/10 px-3 py-2 text-sm text-[var(--color-storefront)]">
          If that email is registered, a password reset link is on its way.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <Button type="submit" loading={submitting} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
        <Link
          to="/login"
          className="font-medium text-[var(--color-storefront)] hover:underline"
        >
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
