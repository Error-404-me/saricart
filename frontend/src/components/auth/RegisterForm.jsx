import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Store } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import Input from "../common/Input";
import PasswordInput from "../common/PasswordInput";
import Button from "../common/Button";
import {
  isValidEmail,
  isValidUsername,
  passwordIssues,
} from "../../utils/validators";

export default function RegisterForm() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const ROLES = [
    {
      value: "customer",
      label: t("auth.roleCustomerLabel"),
      hint: t("auth.roleCustomerHint"),
      icon: User,
    },
    {
      value: "owner",
      label: t("auth.roleOwnerLabel"),
      hint: t("auth.roleOwnerHint"),
      icon: Store,
    },
  ];

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errors = {};
    if (!isValidUsername(form.username))
      errors.username = "3-50 characters: letters, numbers, underscores.";
    if (!isValidEmail(form.email))
      errors.email = "Enter a valid email address.";
    const pwIssues = passwordIssues(form.password);
    if (pwIssues.length)
      errors.password = `Password must be ${pwIssues.join(", ")}.`;
    if (!acceptedTerms)
      errors.acceptedTerms = "You must agree to the Terms and Conditions.";
    if (!acceptedPrivacy)
      errors.acceptedPrivacy =
        "You must confirm you've read the Privacy Policy.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({ ...form, acceptedTerms, acceptedPrivacy });
      navigate("/verify-email-sent", { state: { email: form.email } });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {ROLES.map((r) => (
          <label
            key={r.value}
            className={`cursor-pointer rounded-xl border px-3.5 py-3 text-sm transition
              ${
                form.role === r.value
                  ? "border-[var(--color-storefront)] bg-[var(--color-storefront)]/5 ring-1 ring-[var(--color-storefront)]/20"
                  : "border-[var(--color-border)] hover:border-[var(--color-storefront)]/30"
              }`}
          >
            <input
              type="radio"
              name="role"
              value={r.value}
              checked={form.role === r.value}
              onChange={handleChange}
              className="sr-only"
            />
            <r.icon
              className={`mb-1.5 h-4 w-4 ${form.role === r.value ? "text-[var(--color-storefront)]" : "text-[var(--color-muted)]"}`}
            />
            <span className="block font-medium text-[var(--color-ink)]">
              {r.label}
            </span>
            <span className="block text-xs text-[var(--color-muted)]">
              {r.hint}
            </span>
          </label>
        ))}
      </div>

      <Input
        id="username"
        name="username"
        label={t("auth.usernameLabel")}
        placeholder="aling_nena"
        autoComplete="username"
        value={form.username}
        onChange={handleChange}
        error={fieldErrors.username}
      />
      <Input
        id="email"
        name="email"
        type="email"
        label={t("auth.emailLabel")}
        placeholder="you@example.com"
        autoComplete="email"
        value={form.email}
        onChange={handleChange}
        error={fieldErrors.email}
      />
      <PasswordInput
        id="password"
        name="password"
        label={t("auth.passwordLabel")}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        value={form.password}
        onChange={handleChange}
        error={fieldErrors.password}
      />

      <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] p-3.5">
        <label className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border)]"
            aria-describedby="terms-error"
          />
          <span>
            I agree to the{" "}
            <Link
              to="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-storefront)] hover:underline"
            >
              Terms and Conditions
            </Link>
          </span>
        </label>
        {fieldErrors.acceptedTerms && (
          <p
            id="terms-error"
            className="pl-6.5 text-xs text-[var(--color-crate)]"
            role="alert"
          >
            {fieldErrors.acceptedTerms}
          </p>
        )}

        <label className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
          <input
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border)]"
            aria-describedby="privacy-error"
          />
          <span>
            I have read the{" "}
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-storefront)] hover:underline"
            >
              Privacy Policy
            </Link>
          </span>
        </label>
        {fieldErrors.acceptedPrivacy && (
          <p
            id="privacy-error"
            className="pl-6.5 text-xs text-[var(--color-crate)]"
            role="alert"
          >
            {fieldErrors.acceptedPrivacy}
          </p>
        )}
      </div>

      {formError && (
        <p
          className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
          role="alert"
        >
          {formError}
        </p>
      )}

      <Button
        type="submit"
        loading={submitting}
        disabled={!acceptedTerms || !acceptedPrivacy}
        className="mt-1 w-full"
      >
        {t("auth.createAccountButton")}
      </Button>

      <p className="text-center text-sm text-[var(--color-muted)]">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link
          to="/login"
          className="font-medium text-[var(--color-storefront)] hover:underline"
        >
          {t("auth.logInLink")}
        </Link>
      </p>
    </form>
  );
}
