import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Input from "../common/Input";
import PasswordInput from "../common/PasswordInput";
import Button from "../common/Button";
import { isValidEmail } from "../../utils/validators";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errors = {};
    if (!isValidEmail(form.email))
      errors.email = "Enter a valid email address.";
    if (!form.password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login(form);
      const redirectTo =
        location.state?.from?.pathname ||
        (user.role === "owner" ? "/owner/dashboard" : "/");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        value={form.email}
        onChange={handleChange}
        error={fieldErrors.email}
      />
      <PasswordInput
        id="password"
        name="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        value={form.password}
        onChange={handleChange}
        error={fieldErrors.password}
      />

      {formError && (
        <p
          className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
          role="alert"
        >
          {formError}
        </p>
      )}

      <Button type="submit" loading={submitting} className="mt-1 w-full">
        Log in
      </Button>

      <p className="text-center text-sm text-[var(--color-muted)]">
        New to SariCart?{" "}
        <Link
          to="/register"
          className="font-medium text-[var(--color-storefront)] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
