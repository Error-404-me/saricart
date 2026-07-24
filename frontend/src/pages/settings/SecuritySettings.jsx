import { useState } from "react";
import { LogOut, KeyRound } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import PasswordInput from "../../components/common/PasswordInput";
import Button from "../../components/common/Button";
import { passwordIssues } from "../../utils/validators";
import { changePassword } from "../../services/userService";

export default function SecuritySettings() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errors = {};
    if (!form.currentPassword) errors.currentPassword = "Enter your current password.";
    const issues = passwordIssues(form.newPassword);
    if (issues.length) errors.newPassword = `Password must be ${issues.join(", ")}.`;
    if (form.confirmPassword !== form.newPassword) errors.confirmPassword = "Passwords don't match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSaved(false);
    if (!validate()) return;
    setSaving(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setFormError(err.response?.data?.detail || "Couldn't update your password. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--color-ink)]">
          <KeyRound className="h-4 w-4 text-[var(--color-storefront)]" />
          Change password
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Use a password you're not using anywhere else.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-4">
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            label="Current password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={handleChange}
            error={fieldErrors.currentPassword}
          />
          <PasswordInput
            id="newPassword"
            name="newPassword"
            label="New password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={handleChange}
            error={fieldErrors.newPassword}
          />
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
          />

          {formError && (
            <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
              {formError}
            </p>
          )}
          {saved && (
            <p className="rounded-lg bg-[var(--color-storefront)]/10 px-3 py-2 text-sm text-[var(--color-storefront)]">
              Password updated.
            </p>
          )}

          <Button type="submit" variant="primary" loading={saving} className="w-fit">
            Update password
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Session</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Signed in as {user?.username}. Logging out ends your session on this device.
        </p>
        <Button variant="ghost" onClick={logout} className="mt-3 gap-1.5 !text-[var(--color-crate)]">
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}