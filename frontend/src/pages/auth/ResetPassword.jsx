import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import PasswordInput from "../../components/common/PasswordInput";
import Button from "../../components/common/Button";
import { resetPassword } from "../../services/authService";
import { passwordIssues } from "../../utils/validators";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errors = {};
    const issues = passwordIssues(password);
    if (issues.length)
      errors.password = `Password must be ${issues.join(", ")}.`;
    if (confirm !== password) errors.confirm = "Passwords don't match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!token) {
      setFormError("This reset link is missing its token.");
      return;
    }
    if (!validate()) return;
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      navigate("/login", { replace: true, state: { passwordReset: true } });
    } catch (err) {
      setFormError(
        err.response?.data?.detail ||
          "Couldn't reset your password. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Choose a new password for your account."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <PasswordInput
          id="password"
          label="New password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        <PasswordInput
          id="confirm"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={fieldErrors.confirm}
        />
        {formError && (
          <p
            className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
            role="alert"
          >
            {formError}
          </p>
        )}
        <Button type="submit" loading={submitting} className="w-full">
          Reset password
        </Button>
      </form>
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
