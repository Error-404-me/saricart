import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Input from "../common/Input";
import Button from "../common/Button";
import { isValidEmail, isValidUsername, passwordIssues } from "../../utils/validators";

const ROLES = [
  { value: "customer", label: "I'm a customer", hint: "Browse stores & pre-order" },
  { value: "owner", label: "I own a store", hint: "List products & manage orders" },
];

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errors = {};
    if (!isValidUsername(form.username)) {
      errors.username = "3-50 characters: letters, numbers, underscores.";
    }
    if (!isValidEmail(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    const pwIssues = passwordIssues(form.password);
    if (pwIssues.length) {
      errors.password = `Password must be ${pwIssues.join(", ")}.`;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await register(form);
      navigate(user.role === "owner" ? "/owner/dashboard" : "/", { replace: true });
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
            className={`cursor-pointer rounded-lg border px-3 py-2.5 text-sm transition
              ${
                form.role === r.value
                  ? "border-[var(--color-storefront)] bg-[var(--color-storefront)]/5"
                  : "border-[var(--color-border)] hover:border-[var(--color-border)]"
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
            <span className="block font-medium text-[var(--color-ink)]">{r.label}</span>
            <span className="block text-xs text-[var(--color-muted)]">{r.hint}</span>
          </label>
        ))}
      </div>

      <Input
        id="username"
        name="username"
        label="Username"
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
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        value={form.email}
        onChange={handleChange}
        error={fieldErrors.email}
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        value={form.password}
        onChange={handleChange}
        error={fieldErrors.password}
      />

      {formError && (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
          {formError}
        </p>
      )}

      <Button type="submit" loading={submitting} className="mt-1 w-full">
        Create account
      </Button>

      <p className="text-center text-sm text-[var(--color-muted)]">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-[var(--color-storefront)] hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
